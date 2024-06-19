// vs AI Mode Button
document.addEventListener('DOMContentLoaded', function() {
    const aiModeBtn = document.getElementById('aiModeBtn');
    const gameHiddenDiv = document.getElementById('tournamentDisplayName');
	const createBtn = document.getElementById('createGameBtn');
    const joinBtn = document.getElementById('joinGameBtn');
	

    aiModeBtn.addEventListener('click', function() {
		if (!gameHiddenDiv.classList.contains('d-none'))
			gameHiddenDiv.classList.toggle('d-none');
		if (createBtn.classList.contains('d-none'))
			createBtn.classList.toggle('d-none');
		if (!joinBtn.classList.contains('d-none'))
			joinBtn.classList.toggle('d-none');
    });
});

// Local Mode Button
document.addEventListener('DOMContentLoaded', function() {
    const localModeBtn = document.getElementById('localModeBtn');
    const gameHiddenDiv = document.getElementById('tournamentDisplayName');
	const createBtn = document.getElementById('createGameBtn');
    const joinBtn = document.getElementById('joinGameBtn');

    localModeBtn.addEventListener('click', function() {
		if (!gameHiddenDiv.classList.contains('d-none'))
			gameHiddenDiv.classList.toggle('d-none');
		if (createBtn.classList.contains('d-none'))
			createBtn.classList.toggle('d-none');
		if (!joinBtn.classList.contains('d-none'))
			joinBtn.classList.toggle('d-none');
    });
});

// Remote Mode Button
document.addEventListener('DOMContentLoaded', function() {
    const remoteModeBtn = document.getElementById('remoteModeBtn');
    const gameHiddenDiv = document.getElementById('tournamentDisplayName');
    const joinBtn = document.getElementById('joinGameBtn');
	const createBtn = document.getElementById('createGameBtn');

    remoteModeBtn.addEventListener('click', function() {
		if (!gameHiddenDiv.classList.contains('d-none'))
			gameHiddenDiv.classList.toggle('d-none');
		if (createBtn.classList.contains('d-none'))
			createBtn.classList.toggle('d-none');
		if (joinBtn.classList.contains('d-none'))
			joinBtn.classList.toggle('d-none');
    });
});

// Tournament Mode Buttons
document.addEventListener('DOMContentLoaded', function() {
    const tournamentModeBtn = document.getElementById('tournamentModeBtn');
    const gameHiddenDiv = document.getElementById('tournamentDisplayName');
	const joinBtn = document.getElementById('joinGameBtn');
	const createBtn = document.getElementById('createGameBtn');

    tournamentModeBtn.addEventListener('click', function() {
		if (gameHiddenDiv.classList.contains('d-none'))
			gameHiddenDiv.classList.toggle('d-none');
		if (createBtn.classList.contains('d-none'))
			createBtn.classList.toggle('d-none');
		if (joinBtn.classList.contains('d-none'))
			joinBtn.classList.toggle('d-none');
    });
});
