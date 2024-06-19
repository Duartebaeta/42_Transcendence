document.addEventListener('DOMContentLoaded', function() {
    const aiModeBtn = document.getElementById('aiModeBtn');
    const localModeBtn = document.getElementById('localModeBtn');
    const remoteModeBtn = document.getElementById('remoteModeBtn');
    const tournamentModeBtn = document.getElementById('tournamentModeBtn');

    const gameHiddenDiv = document.getElementById('tournamentDisplayName');
	const createBtn = document.getElementById('createGameBtn');
    const joinBtn = document.getElementById('joinGameBtn');
	

	// vs AI Mode
    aiModeBtn.addEventListener('click', function() {
		gameHiddenDiv.classList.add('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.add('d-none');
    });

	// Local vs Mode
	localModeBtn.addEventListener('click', function() {
		gameHiddenDiv.classList.add('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.add('d-none');
    });

	// Remote vs Mode
	remoteModeBtn.addEventListener('click', function() {
		gameHiddenDiv.classList.add('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.remove('d-none');
    });
	
	// Tournament Mode
	tournamentModeBtn.addEventListener('click', function() {
		gameHiddenDiv.classList.remove('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.remove('d-none');
    });
});
