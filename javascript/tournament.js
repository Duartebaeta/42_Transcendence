let gameId = "";
let username;
let socket;
let isSocketConnected = false;
var Pong;

var BACKEND_IP = "172.20.10.3"
var PORT = "8000"

function startTournament(event) {
	event.preventDefault();
	const generateRandomString = length => 
		Array.from({ length }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
	username = generateRandomString(10);
	gameId = 123;
	const waiting_room = document.querySelector('.waiting-room');
	const game_menu = document.querySelector('.game-menu');

	socket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/game/${gameId}/${username}/`);
	socket.onopen = function(e) {
		console.log("[open] Connection established");
		isSocketConnected = true; // Mark the socket as connected
		waiting_room.classList.remove('d-none');
		game_menu.classList.add('d-none');

	};
}

export { startTournament };