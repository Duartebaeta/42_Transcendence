import { startSinglePlayer } from "./singleplayer.js";
import { startGame } from "./pong.js";
import { startLocal } from "./local.js";
import { startTournament } from "./tournament.js";

document.addEventListener('DOMContentLoaded', function () {
	console.log('DOM loaded');
	document.getElementById('aiModeBtn').addEventListener('click', startSinglePlayer);
	document.getElementById('localModeBtn').addEventListener('click', startLocal);
	document.getElementById('remoteModeBtn').addEventListener('click', startGame);
});