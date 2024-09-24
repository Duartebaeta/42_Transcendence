import { BACKEND_IP, PORT } from "./game-logic.js";
import { startGame } from "./pong.js";

let TournamentSocket;
let GameManagerSocket
let currentRound = 1;
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
			populateBrackets(data);
			showBrackets();
			setTimeout(function() {
				startRound(tournamentData, displayName);
			}
			, 5000);
		} else if (data.type === 'tournament_final') {
			console.log('Final round:', data);
			tournamentData = data;
			setTimeout(function() {
				startFinalRound(tournamentData, displayName);
			}
			, 5000);
		} else if (data.type === 'tournament_winner') {
			console.log('Tournament winner:', data);
			endTournament(displayName, data.winner);
		} else if (data.type === 'update_brackets') {
			console.log('Updating brackets:', data);
			tournamentData = data;
			updateBrackets(tournamentData);
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
		if (data.type === 'game_ended') {
			console.log('Game over received in tournament end:', data);
			let processed_data = {
				'gameID': data.gameState.game_id,
				'participants': [data.gameState.player, data.gameState.opponent],
				'winner': data.gameState.won ? data.gameState.player : data.gameState.opponent,
				'loser': data.gameState.won ? data.gameState.opponent : data.gameState.player
			};
			TournamentSocket.send(JSON.stringify({ type: 'game_over', data: processed_data }));
			showBrackets();
			
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

function endTournament(displayName, winner = null) {
	console.log('Ending tournament');
	let tournamentBrackets = document.querySelector('.tournament-brackets');
	let game_window = document.querySelector('.game');
	let home_button = document.querySelector('#tournament-home-button');
	let tournament_text_box = document.querySelector('#tournament-text-box');
	let final_players = document.querySelectorAll('.round-2-participant');
	let game_menu = document.querySelector('.game-menu');

	if (winner != null) {
		final_players.forEach(function (player) {
			if (player.innerHTML == winner) {
				player.classList.add('green-highlight');
			} else {
				player.classList.add('red-highlight');
			}
		});
	}

	if (winner == displayName) {
		document.querySelector('#tournament-text').innerHTML = 'Congratulations! You won the tournament!';
		document.querySelector('.tournament-winner').innerHTML = displayName;
	} else {
		document.querySelector('#tournament-text').innerHTML = 'Better luck next time! You lost the tournament!';
	}

	tournamentBrackets.classList.remove('d-none');
	game_window.classList.add('d-none');
	tournament_text_box.classList.remove('d-none');

	home_button.classList.remove('d-none');
	home_button.addEventListener('click', function () {
		TournamentSocket.close();
		GameManagerSocket.close();
		tournamentBrackets.classList.add('d-none');
		tournament_text_box.classList.add('d-none');
		game_menu.classList.remove('d-none');
	});
}

function populateBrackets(data) {
	console.log('Populating brackets:', data);
	let players = document.querySelectorAll('.round-1-participant');

	players.forEach(function (player, index) {
		player.innerHTML = data.participants[index];
	});
}

function showBrackets() {
	let tournamentBrackets = document.querySelector('.tournament-brackets');
	let waitingRoom = document.querySelector('.waiting-room');
	let game_window = document.querySelector('.game');

	waitingRoom.classList.add('d-none');
	game_window.classList.add('d-none');
	tournamentBrackets.classList.remove('d-none');
}

function updateBrackets(data) {
	console.log('Showing brackets:', data);
	let players = document.querySelectorAll('.round-1-participant');
	let final_players = document.querySelectorAll('.round-2-participant');
	let winner = document.querySelector('.tournament-winner');


	if (data.round == 1) {
		players.forEach(function (player) {
			if (data.winner == player.innerHTML) {
				player.classList.add('green-highlight');
			} else if (data.loser == player.innerHTML) {
				player.classList.add('red-highlight');
			}
		});
		final_players.forEach(function (player) {
			if (player.dataset.gameId == data.gameID) {
				player.innerHTML = data.winner;
			}
		});
	} else if (data.round == 2) {
		final_players.forEach(function (player) {
			if (data.winner == player.innerHTML) {
				player.classList.add('green-highlight');
			} else if (data.loser == player.innerHTML) {
				player.classList.add('red-highlight');
			}
		});
		winner.innerHTML = data.winner;
	}
}

function startRound(data, displayName) {
	console.log('Starting round:', data);
	let final_players = document.querySelectorAll('.round-2-participant');

	document.querySelector('.tournament-brackets').classList.add('d-none');
	final_players[0].dataset.gameId = data['gameID_1'];
	final_players[1].dataset.gameId = data['gameID_2'];

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

	} else {
		// Display message that the player has lost
		console.log('Player lost');
		endTournament(displayName);
	}
}

function startFinalRound(data, displayName) {
	console.log('Starting final round:', data);

	document.querySelector('.tournament-brackets').classList.add('d-none');

	if (data['matching'].includes(displayName)) {
		console.log('Starting game:', data['gameID']);
		let message = JSON.stringify({
			type: 'change_group',
			game_id: data['gameID'],
			group_name: 'game_manager_' + data['gameID']
		});
		
		// Send the message via the function that handles the socket state
		sendSocketMessage(message);

		startGame(data['gameID'], displayName);
	} else {
		// Display message that the player has lost
		console.log('Player lost');
		endTournament(displayName);
	}
}

export { startTournament };