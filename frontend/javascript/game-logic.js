import { startSinglePlayer } from "./singleplayer.js";
import { startGame } from "./pong.js";
import { startLocal } from "./local.js";
import { startTournament } from "./tournament.js";

let socket;
let BACKEND_IP = "10.19.249.137"
let PORT = "8000"

document.addEventListener('DOMContentLoaded', function () {
	console.log(BACKEND_IP);

	document.getElementById('aiModeBtn').addEventListener('click', startSinglePlayer);
	document.getElementById('localModeBtn').addEventListener('click', startLocal);
	document.getElementById('remoteModeBtn').addEventListener('click', startGame);

	// Establish WebSocket connection
	socket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/tournament/`);

	// Handle incoming messages from the backend
	socket.onmessage = function(event) {
		const data = JSON.parse(event.data);
		handleWebSocketMessage(data);
	};

	let tournamentForm = document.getElementById('tournamentPlayerInfo');

	tournamentForm.addEventListener('submit', function(event) {
		event.preventDefault();
		console.log('Form submitted:', event.target);
		let clickedButton = document.activeElement;
		let tournamentId;

		let tournamentDisplayName = event.target.elements[0].value;

		if (clickedButton.id === 'joinTournamentBtn') {
			tournamentId = event.target.elements[1].value;
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
	}
}

function joinTournament(displayName, tournamentID) {
	console.log('Joining tournament:', tournamentID, 'as', displayName);
	const message = {
		type: 'join_tournament',
		displayName: displayName,
		tournamentID: tournamentID
	};
	socket.send(JSON.stringify(message));
}

function createTournament(displayName) {
	console.log('Creating tournament as', displayName);
	const message = {
		type: 'create_tournament',
		displayName: displayName
	};
	socket.send(JSON.stringify(message));
}

export { BACKEND_IP, PORT };