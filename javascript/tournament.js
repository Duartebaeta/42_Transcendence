var BACKEND_IP = "192.168.68.66"
var PORT = "8000"


function startTournament(displayName, tournamentID) {
	// Connect to WebSocket for the tournament
	const socket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/tournament/${tournamentID}/${displayName}/`);

	socket.onopen = function () {
		console.log('Connected to tournament:', tournamentID);
		document.querySelector('.tournament-selector').classList.add('d-none');
		document.querySelector('.waiting-room').classList.remove('d-none');
		document.querySelector('#player1').textContent = displayName;
	};

	socket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		// Handle incoming messages related to the tournament
	};

	socket.onclose = function () {
		console.log('Disconnected from tournament:', tournamentID);
	};

	socket.onerror = function (error) {
		console.error('WebSocket error:', error);
	};
}
export { startTournament };