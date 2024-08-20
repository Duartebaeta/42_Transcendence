import { startSinglePlayer } from "./singleplayer.js";
import { startGame } from "./pong.js";
import { startLocal } from "./local.js";
import { startTournament } from "./tournament.js";

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('aiModeBtn').addEventListener('click', startSinglePlayer);
	document.getElementById('localModeBtn').addEventListener('click', startLocal);
	document.getElementById('remoteModeBtn').addEventListener('click', startGame);

	let tournamentForm = document.getElementById('tournamentForm')
	let csrftoken = getCookie('csrftoken');

	tournamentForm.addEventListener('submit', function(event) {
		event.preventDefault();
		let clickedButton = document.activeElement;
		let tournamentId;

		let tournamentDisplayName = event.target.elements[0].value;

		if (clickedButton.id === 'joinTournamentBtn') {
			tournamentId = event.target.elements[1].value;
			console.log('Joining tournament:', tournamentDisplayName, tournamentId);
			joinTournament(tournamentDisplayName, tournamentId, csrftoken);
		} else if (clickedButton.id === 'createTournamentBtn') {
			createTournament(csrftoken);
		}
	});
});

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function joinTournament(displayName, tournamentID, csrftoken) {
	fetch(`http://192.168.68.66:8000/api/tournament/${tournamentID}`)
		.then(response => {
			if (response.ok) {
				startTournament(displayName, tournamentID);
			} else {
				alert('Tournament not found!');
			}
		})
		.catch(error => {
			console.error('Error joining tournament:', error);
		});
}

function createTournament(csrftoken) {
	console.log('token: ', csrftoken);
	fetch('http://192.168.68.66:8000/api/tournament/create/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken
		}
	})
		.then(response => response.json())
		.then(data => {
			const tournamentID = data.tournamentID;
			startTournament(displayName, tournamentID);
		})
		.catch(error => {
			console.error('Error creating tournament:', error);
		});
}