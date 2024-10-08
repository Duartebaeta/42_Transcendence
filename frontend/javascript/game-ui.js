document.addEventListener('DOMContentLoaded', function() {
	const localModeBtn = document.getElementById('localModeBtn');
	const remoteModeBtn = document.getElementById('remoteModeBtn');
	const tournamentModeBtn = document.getElementById('tournamentModeBtn');

	const gameHiddenDiv = document.getElementById('tournamentPlayerInfo');
	const remoteHiddenDiv = document.getElementById('remotePlayerInfo');
	const createBtn = document.getElementById('createRemoteBtn');
	const joinBtn = document.getElementById('joinRemoteBtn');
	const createTournamentBtn = document.getElementById('createTournamentBtn');
	const joinTournamentBtn = document.getElementById('joinTournamentBtn');

	// Local vs Mode
	localModeBtn.addEventListener('click', function() {
		// Add Coloring To The Pressed Button
		remoteModeBtn.classList.remove('bg-warning');
		tournamentModeBtn.classList.remove('bg-warning');

		// Display Selected Mode Options
		gameHiddenDiv.classList.add('d-none');
		createTournamentBtn.classList.add('d-none');
		joinTournamentBtn.classList.add('d-none');

		createBtn.classList.remove('d-none');
		joinBtn.classList.add('d-none');
    });

	// Remote vs Mode
	remoteModeBtn.addEventListener('click', function() {
		// Add Coloring To The Pressed Button
		localModeBtn.classList.remove('bg-warning');
		remoteModeBtn.classList.add('bg-warning');
		tournamentModeBtn.classList.remove('bg-warning');

		// Display Selected Mode Options
		gameHiddenDiv.classList.add('d-none');
		remoteHiddenDiv.classList.remove('d-none');
		createTournamentBtn.classList.add('d-none');
		joinTournamentBtn.classList.add('d-none');

		createBtn.classList.remove('d-none');
		joinBtn.classList.remove('d-none');
    });
	
	// Tournament Mode
	tournamentModeBtn.addEventListener('click', function() {
		// Add Coloring To The Pressed Button
		localModeBtn.classList.remove('bg-warning');
		remoteModeBtn.classList.remove('bg-warning');
		tournamentModeBtn.classList.add('bg-warning');

		// Display Selected Mode Options
		gameHiddenDiv.classList.remove('d-none');
		remoteHiddenDiv.classList.add('d-none');
		createTournamentBtn.classList.remove('d-none');
		joinTournamentBtn.classList.remove('d-none');

		createBtn.classList.add('d-none');
		joinBtn.classList.add('d-none');
    });
});
