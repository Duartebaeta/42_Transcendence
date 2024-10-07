import { BACKEND_IP, PORT } from "./game-logic.js";
import { startGame } from "./pong.js";

let TournamentSocket;
let GameManagerSocket
let tournamentRunning = false;
let socketMessageQueue = [];

function startTournament(displayName, tournamentID) {
	var request = {
		method: 'GET', // HTTP method
		url: 'https://localhost:8000/user/me/',
		headers: {
			'Content-Type': 'application/json',
		}
	};

	authenticatedRequest(request.url, request)
	.then((response) => response.json())
	.then((json) => {
		// Connect to WebSocket for the tournament
		TournamentSocket = new WebSocket(`wss://${BACKEND_IP}:${PORT}/ws/gamebackend/tournament/${tournamentID}/${displayName}/`);
		GameManagerSocket = new WebSocket(`wss://${BACKEND_IP}:${PORT}/ws/gamebackend/GameManager/`);

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
			console.log('Received message:', data);
			// Handle incoming messages related to the tournament
			if (data.type === 'get_participants') {
				populateWaitingRoom(data);
			} else if (data.type === 'tournament_full') {
				console.log('Tournament is full:', data);
				tournamentRunning = true;
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
				tournamentRunning = false;
				endTournament(displayName, data.winner, json.id);
			} else if (data.type === 'update_brackets') {
				console.log('Updating brackets:', data);
				tournamentData = data;
				updateBrackets(tournamentData);
			} else if (data.type === 'end_tournament') {
				tournamentRunning = false;
				console.log('Ending tournament:', data);
				cancelTournament();
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
	})
	.catch(error => {
		console.error("Error fetching data:", error);
	});
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

function cancelTournament() {
	console.log('Cancelling tournament');
	TournamentSocket.close();
	GameManagerSocket.close();
	let home_button = document.querySelector('#tournament-home-button');
	let tournamentBrackets = document.querySelector('.tournament-brackets');
	let tournament_text_box = document.querySelector('#tournament-text-box');
	let game_menu = document.querySelector('.game-menu');
	let game_window = document.querySelector('.game');
	document.querySelector('#tournament-text').innerHTML = 'Tournament has ended';
	home_button.addEventListener('click', function () {
		tournamentBrackets.classList.add('d-none');
		tournament_text_box.classList.add('d-none');
		game_menu.classList.remove('d-none');
		resetTournamentBrackets();
	});
	document.querySelector('.waiting-room').classList.add('d-none');
	game_window.classList.add('d-none');
	tournamentBrackets.classList.remove('d-none');
	document.querySelector('#tournament-text-box').classList.remove('d-none');
	home_button.classList.remove('d-none');
}

function endTournament(displayName, winner = null, user_id = null) {
	console.log('Ending tournament');
	let tournamentBrackets = document.querySelector('.tournament-brackets');
	let game_window = document.querySelector('.game');
	let home_button = document.querySelector('#tournament-home-button');
	let tournament_text_box = document.querySelector('#tournament-text-box');
	let final_players = document.querySelectorAll('.round-2-participant');
	let game_menu = document.querySelector('.game-menu');

	if (winner != null && user_id != null) {
		final_players.forEach(function (player) {
			if (player.innerHTML == winner) {
				player.classList.add('green-highlight');
			} else {
				player.classList.add('red-highlight');
			}
		});
		var request = {
			method: 'POST', // HTTP method
			url: 'https://localhost:8080/user-stats/tournament/',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: user_id
			})
		};
		authenticatedRequest(request.url, request)
		.catch(error => {
			console.error("Error fetching data:", error);
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
		resetTournamentBrackets();
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
	if (!tournamentRunning)
		return;
	let tournamentBrackets = document.querySelector('.tournament-brackets');
	let waitingRoom = document.querySelector('.waiting-room');
	let game_window = document.querySelector('.game');

	waitingRoom.classList.add('d-none');
	game_window.classList.add('d-none');
	tournamentBrackets.classList.remove('d-none');
}

function updateBrackets(data) {
	if (!tournamentRunning)
		return;
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
	if (!tournamentRunning)
		return;
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
		sendSocketMessage(message);
		startGame(data['gameID_1'], displayName);

	} else if (data['matching_2'].includes(displayName)) {
		console.log('Starting game:', data['gameID_2']);
		let message = JSON.stringify({
			type: 'change_group',
			game_id: data['gameID_2'],
			group_name: 'game_manager_' + data['gameID_2']
		});
		sendSocketMessage(message);
		startGame(data['gameID_2'], displayName);

	} else {
		// Display message that the player has lost
		console.log('Player lost');
		endTournament(displayName);
	}
}

function startFinalRound(data, displayName) {
	if (!tournamentRunning)
		return;
	console.log('Starting final round:', data);

	document.querySelector('.tournament-brackets').classList.add('d-none');

	if (data['matching'].includes(displayName)) {
		console.log('Starting game:', data['gameID']);
		let message = JSON.stringify({
			type: 'change_group',
			game_id: data['gameID'],
			group_name: 'game_manager_' + data['gameID']
		});
		sendSocketMessage(message);
		startGame(data['gameID'], displayName);
	} else {
		// Display message that the player has lost
		console.log('Player lost');
		endTournament(displayName);
	}
}

function resetTournamentBrackets() {
	// Get all round 1 participants
	let round1Participants = document.querySelectorAll('.round-1-participant');
	round1Participants.forEach(participant => {
		participant.innerHTML = '...';  // Reset the content
		participant.classList.remove('green-highlight', 'red-highlight');  // Remove any added highlight classes
	});

	// Get all round 2 participants
	let round2Participants = document.querySelectorAll('.round-2-participant');
	round2Participants.forEach(participant => {
		participant.innerHTML = '...';  // Reset the content
		participant.classList.remove('green-highlight', 'red-highlight');  // Remove any added highlight classes
	});

	// Get the tournament winner element and reset it
	let winnerElement = document.querySelector('.tournament-winner');
	winnerElement.innerHTML = '...';  // Reset the winner content
	winnerElement.classList.remove('green-highlight', 'red-highlight');  // Remove any highlight classes
}

export { startTournament };