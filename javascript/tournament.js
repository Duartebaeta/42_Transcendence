import { BACKEND_IP, PORT } from "./game-logic.js";
import { startGame } from "./pong.js";

function startTournament(displayName, tournamentID) {
	console.log('Starting tournament:', tournamentID, 'as', displayName);
	// Connect to WebSocket for the tournament
	const TournamentSocket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/tournament/${tournamentID}/${displayName}/`);
	const GameManagerSocket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/GameManager/`);

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
			startRound(tournamentData, displayName);
		}
	};

	TournamentSocket.onclose = function () {
		console.log('Disconnected from tournament:', tournamentID);
	};

	TournamentSocket.onerror = function (error) {
		console.error('WebSocket error:', error);
	};

	GameManagerSocket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		// Handle incoming messages related to the game
		if (data.type === 'game_ended') {
			console.log('Game over received in tournament end:', data);
		}
	}
}

function populateWaitingRoom(data) {
	const participantsList = document.querySelectorAll('.participant_name');

	data.participants.forEach(function (participant, counter) {
		participantsList[counter].innerHTML = participant;
	});
}
function startRound(data, displayName) {
	console.log('Starting round:', data);
	document.querySelector('.waiting-room').classList.add('d-none');
	if (data['matching_1'].includes(displayName)) {
		console.log(startGame(data['gameID_1']));
	} else {
		console.log(startGame(data['gameID_2']));
	}
}

export { startTournament };