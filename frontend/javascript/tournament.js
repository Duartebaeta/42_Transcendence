import { BACKEND_IP, PORT } from "./game-logic.js";
import { startGame } from "./pong.js";

let TournamentSocket;
let GameManagerSocket
let socketMessageQueue = [];

function startTournament(displayName, tournamentID) {
	console.log('Starting tournament:', tournamentID, 'as', displayName);
	// Connect to WebSocket for the tournament
	TournamentSocket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/tournament/${tournamentID}/${displayName}/`);
	GameManagerSocket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/GameManager/`);

	let tournamentData;

	TournamentSocket.onopen = function () {
		console.log('Connected to tournament:', tournamentID);
		document.querySelector('.game-menu').classList.add('d-none');
		document.querySelector('.waiting-room').classList.remove('d-none');
		
		document.querySelector('#tournamentGameId').textContent = tournamentID;
		TournamentSocket.send(JSON.stringify({ type: 'get_participants' }));
	};

	TournamentSocket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		// Handle incoming messages related to the tournament
		if (data.type === 'get_participants') {
			populateWaitingRoom(data);
		} else if (data.type === 'tournament_full') {
			console.log('Tournament is full:', data);
			tournamentData = data;
			showBrackets(tournamentData, displayName);
		} else if (data.type === 'tournament_final') {
			console.log('Final round:', data);
			tournamentData = data;
			startFinalRound(tournamentData, displayName);
		}
	};

	TournamentSocket.onclose = function () {
		console.log('Disconnected from tournament:', tournamentID);
	};

	TournamentSocket.onerror = function (error) {
		console.error('WebSocket error:', error);
	};

	GameManagerSocket.onmessage = function (event) {
		console.log('Received message:', event.data)
		const data = JSON.parse(event.data);
		console.log('Parsed data:', data);
		// Handle incoming messages related to the game
		if (data.type === 'game_ended') {
			console.log('Game over received in tournament end:', data);
			let processed_data = {
				'gameID': data.gameState.game_id,
				'participants': [data.gameState.player, data.gameState.opponent],
				'winner': data.gameState.won ? data.gameState.player : data.gameState.opponent
			};
			console.log('Processed data:', processed_data);
			TournamentSocket.send(JSON.stringify({ type: 'game_over', data: processed_data }));
		}
		else {
			console.log('Game over received in tournament end:', data);
		}
	}
	GameManagerSocket.onopen = function () {
		console.log('Connected to GameManager');
	
		// Process any messages that were queued while the socket was still connecting
		socketMessageQueue.forEach(msg => GameManagerSocket.send(msg));
		socketMessageQueue = [];  // Clear the queue after sending
	};

}

// Function to handle the WebSocket send logic
function sendSocketMessage(message) {
	if (GameManagerSocket.readyState === WebSocket.OPEN) {
		GameManagerSocket.send(message);
	} else {
		// Queue messages if the socket is still connecting
		console.log('Socket not ready, queuing message');
		socketMessageQueue.push(message);
	}
}

function populateWaitingRoom(data) {
	const participantsList = document.querySelectorAll('.participant_name');

	data.participants.forEach(function (participant, counter) {
		participantsList[counter].innerHTML = participant;
	});
}

function showBrackets(data, displayName) {
	console.log('Showing brackets:', data);
	let tournamentBrackets = document.querySelector('.tournament-brackets');
	let waitingRoom = document.querySelector('.waiting-room');
	let players = document.querySelectorAll('.round-1-participant');

	waitingRoom.classList.add('d-none');
	data.participants.forEach(function (participant, counter) {
		players[counter].innerHTML = participant;
	});
	tournamentBrackets.classList.remove('d-none');

	setTimeout(function() {
		tournamentBrackets.classList.add('d-none');
		startRound(data, displayName);
	}, 5000);  // 5000 milliseconds = 5 seconds


}

function startRound(data, displayName) {
	console.log('Starting round:', data);

	//document.querySelector('.waiting-room').classList.add('d-none');

	// Start round function
	if (data['matching_1'].includes(displayName)) {
		console.log('Starting game:', data['gameID_1']);
		let message = JSON.stringify({
			type: 'change_group',
			game_id: data['gameID_1'],
			group_name: 'game_manager_' + data['gameID_1']
		});
		
		// Send the message via the function that handles the socket state
		sendSocketMessage(message);
		
		startGame(data['gameID_1'], displayName);

	} else if (data['matching_2'].includes(displayName)) {
		console.log('Starting game:', data['gameID_2']);
		let message = JSON.stringify({
			type: 'change_group',
			game_id: data['gameID_2'],
			group_name: 'game_manager_' + data['gameID_2']
		});
		
		// Send the message via the function that handles the socket state
		sendSocketMessage(message);
		
		startGame(data['gameID_2'], displayName);

	} else if (data['lost'].includes(displayName)) {
		// Display message that the player has lost
		console.log('Player lost');
	}
}

function startFinalRound(data, displayName) {
	console.log('Starting final round:', data);
	if (data['matching'].includes(displayName)) {
		startGame(data['gameID'], displayName);
	}
}

export { startTournament };