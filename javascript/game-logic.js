import { startSinglePlayer } from "./singleplayer.js";
import { startGame } from "./pong.js";

document.addEventListener('DOMContentLoaded', function () {
	console.log('DOM loaded');
	document.getElementById('aiModeBtn').addEventListener('click', startSinglePlayer);
});