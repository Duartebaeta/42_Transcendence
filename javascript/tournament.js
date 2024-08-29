import { BACKEND_IP, PORT } from "./game-logic.js";

function startTournament(displayName, tournamentID) {
	console.log('Starting tournament:', tournamentID, 'as', displayName);
	// Connect to WebSocket for the tournament
	const socket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/tournament/${tournamentID}/${displayName}/`);

	socket.onopen = function () {
		console.log('Connected to tournament:', tournamentID);
		document.querySelector('.game-menu').classList.add('d-none');
		document.querySelector('.waiting-room').classList.remove('d-none');
		
		document.querySelector('#tournamentGameId').textContent = tournamentID;
		socket.send(JSON.stringify({ type: 'get_participants' }));
	};

	socket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		// Handle incoming messages related to the tournament
		if (data.type === 'get_participants') {
			populateWaitingRoom(data);
		}
	};

	socket.onclose = function () {
		console.log('Disconnected from tournament:', tournamentID);
	};

	socket.onerror = function (error) {
		console.error('WebSocket error:', error);
	};
}

function populateWaitingRoom(data) {
	const participantsList = document.querySelectorAll('.participant_name');

	data.participants.forEach(function (participant, counter) {
		participantsList[counter].innerHTML = participant;
	});
}
export { startTournament };