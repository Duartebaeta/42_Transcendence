import { startGame } from "./pong.js";
import { startLocal } from "./local.js";
import { startTournament } from "./tournament.js";

let TournamentSocket;
let RemoteSocket;
let BACKEND_IP = "localhost"
let PORT = "9090"

document.addEventListener('DOMContentLoaded', function () {

	document.getElementById('localModeBtn').addEventListener('click', startLocal);
	document.getElementById('remotePlayerInfo').addEventListener('submit', function(event){
		event.preventDefault();

		// Establish WebSocket connection for GameManager
		RemoteSocket = new WebSocket(`wss://${BACKEND_IP}:${PORT}/ws/gamebackend/GameManager/`);

		RemoteSocket.onmessage = function(event) {
			console.log('Received message:', event.data);
			const data = JSON.parse(event.data);
			handleWebSocketMessage(data);
		};

		let clickedButton = document.activeElement;
		let gameID;

		if (clickedButton.id === 'joinRemoteBtn') {
			gameID = event.target.elements[0].value;
			if (gameID === '') {
				alert('Please enter a game ID');
				return;
			}
			joinRemote(gameID);
		} else if (clickedButton.id === 'createRemoteBtn') {
			createRemote();
		}
	});

	let tournamentForm = document.getElementById('tournamentPlayerInfo');
	let tournamentFormBtn = document.querySelector('#tournamentModeBtn');

	tournamentForm.addEventListener('submit', function(event) {
		event.preventDefault();

		let tournamentDisplayName = event.target.elements[0].value;
		if (tournamentDisplayName === '') {
			alert('Please enter a display name');
			return;
		}

		// Establish WebSocket connection for TournamentManager
		TournamentSocket = new WebSocket(`wss://${BACKEND_IP}:${PORT}/ws/gamebackend/tournament/`);
		// Handle incoming messages from the backend
		TournamentSocket.onmessage = function(event) {
			console.log('Received message:', event.data);
			const data = JSON.parse(event.data);
			tournamentFormBtn.classList.remove('bg-warning');
			tournamentForm.classList.add('d-none');
			handleWebSocketMessage(data);
		};

		console.log('Form submitted:', event.target);
		let clickedButton = document.activeElement;
		let tournamentId;


		if (clickedButton.id === 'joinTournamentBtn') {
			tournamentId = event.target.elements[1].value;
			if (tournamentId === '') {
				alert('Please enter a tournament ID');
				return;
			}
			joinTournament(tournamentDisplayName, tournamentId);
		} else if (clickedButton.id === 'createTournamentBtn') {
			createTournament(tournamentDisplayName);
		}
	});
});

function handleWebSocketMessage(data) {
	console.log('Received message:', data);
	if (data.type === 'tournament_joined') {
		// Handle successful tournament joining
		console.log("Tournament joined:", data);
		startTournament(data.displayName, data.tournamentID);
	} else if (data.type === 'tournament_created') {
		// Handle successful tournament creation
		console.log("Tournament created:", data);
		startTournament(data.displayName, data.tournamentID);
	} else if (data.type === 'error') {
		// Handle errors
		console.error('Error:', data);
		alert(data.message);
	} else if (data.type === 'duplicate_name') {
		// Handle duplicate display name
		console.error('Error:', data);
		alert('Display name already taken. Please choose a different name.');
	} else if (data.type === 'game_joined') {
		// Handle successful game joining
		console.log("Game joined:", data);
		//Change group
		const message = {
			type: 'change_group',
			game_id: data.gameID,
			group_name: 'game_manager_' + data.gameID
		};
		RemoteSocket.send(JSON.stringify(message));
		startGame(data.gameID);
	} else if (data.type === 'game_created') {
		// Handle successful game creation
		console.log("Game created:", data);
		const message = {
			type: 'change_group',
			game_id: data.gameID,
			group_name: 'game_manager_' + data.gameID
		};
		RemoteSocket.send(JSON.stringify(message));
		startGame(data.gameID);
	}
}

function joinTournament(displayName, tournamentID) {
	console.log('Joining tournament:', tournamentID, 'as', displayName);
	const message = {
		type: 'join_tournament',
		displayName: displayName,
		tournamentID: tournamentID
	};
	TournamentSocket.onopen = function () {
		console.log('Connected to TournamentManager');
		TournamentSocket.send(JSON.stringify(message));
	}
}

function createTournament(displayName) {
	console.log('Creating tournament as', displayName);
	const message = {
		type: 'create_tournament',
		displayName: displayName
	};
	TournamentSocket.onopen = function () {
		console.log('Connected to TournamentManager');
		TournamentSocket.send(JSON.stringify(message));
	};
}

function joinRemote(gameID) {
	console.log('Joining remote game:', gameID);
	const message = {
		type: 'join_game',
		gameID: gameID
	};
	RemoteSocket.onopen = function () {
		console.log('Connected to GameManager');
		RemoteSocket.send(JSON.stringify(message));
	};
}

function createRemote() {
	console.log('Creating remote game');
	const message = {
		type: 'create_game'
	};
	RemoteSocket.onopen = function () {
		console.log('Connected to GameManager');
		RemoteSocket.send(JSON.stringify(message));
	};
}

export { BACKEND_IP, PORT };