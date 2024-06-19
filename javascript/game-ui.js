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
		// Add Coloring To The Pressed Button
		aiModeBtn.classList.add('bg-warning');
		localModeBtn.classList.remove('bg-warning');
		remoteModeBtn.classList.remove('bg-warning');
		tournamentModeBtn.classList.remove('bg-warning');
		
		// Display Selected Mode Options
		gameHiddenDiv.classList.add('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.add('d-none');
    });

	// Local vs Mode
	localModeBtn.addEventListener('click', function() {
		// Add Coloring To The Pressed Button
		aiModeBtn.classList.remove('bg-warning');
		localModeBtn.classList.add('bg-warning');
		remoteModeBtn.classList.remove('bg-warning');
		tournamentModeBtn.classList.remove('bg-warning');

		// Display Selected Mode Options
		gameHiddenDiv.classList.add('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.add('d-none');
    });

	// Remote vs Mode
	remoteModeBtn.addEventListener('click', function() {
		// Add Coloring To The Pressed Button
		aiModeBtn.classList.remove('bg-warning');
		localModeBtn.classList.remove('bg-warning');
		remoteModeBtn.classList.add('bg-warning');
		tournamentModeBtn.classList.remove('bg-warning');

		// Display Selected Mode Options
		gameHiddenDiv.classList.add('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.remove('d-none');
    });
	
	// Tournament Mode
	tournamentModeBtn.addEventListener('click', function() {
		// Add Coloring To The Pressed Button
		aiModeBtn.classList.remove('bg-warning');
		localModeBtn.classList.remove('bg-warning');
		remoteModeBtn.classList.remove('bg-warning');
		tournamentModeBtn.classList.add('bg-warning');

		// Display Selected Mode Options
		gameHiddenDiv.classList.remove('d-none');
		createBtn.classList.remove('d-none');
		joinBtn.classList.remove('d-none');
    });
});
