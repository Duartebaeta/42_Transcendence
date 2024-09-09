document.addEventListener("DOMContentLoaded", function() {
	const updateButton = document.getElementById("matchHistoryBtn");

	updateButton.addEventListener("click", function() {
		// Fetch JSON data
		fetch("match-history.json")
			.then(response => response.json())
			.then(data => {
				// Parse JSON data
				const games = data.games;
				
				// Create HTML content
				let outcomes = '';
				let scores = '';
				let opponents = ''
				games.forEach(game => {
					outcomes += `<p class="text-light text-center"> ${game.outcome}</p>`;
					scores += `<p class="text-light text-center">${game.score}</p>`;
					opponents += `<p class="text-light text-center">Opponent: ${game.opponent}`;
				});

				// Update HTML content
				document.getElementById('matchHistoryOutcomes').innerHTML = outcomes;
				document.getElementById('matchHistoryScores').innerHTML = scores;
				document.getElementById('matchHistoryOpponents').innerHTML = opponents;
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});
	});
});
