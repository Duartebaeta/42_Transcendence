// Login Modal Trigger
// document.addEventListener('DOMContentLoaded', function () {
// 	var myModal = new bootstrap.Modal(document.getElementById('login-modal'));
// 	myModal.show();
// });

// Get Player Stats from JSON file
document.addEventListener("DOMContentLoaded", function() {
    const updateButton = document.getElementById("updateButton");
    const dataContainer = document.getElementById("gamesPlayed");

    updateButton.addEventListener("click", function() {
        // Fetch JSON data
        fetch("player-stats.json")
            .then(response => response.json())
            .then(data => {
               // Parse JSON data
				const gamesPlayed = data.gamesPlayed; 
				const wins = data.wins;
				const losses = data.losses;
				const tournamentWins = data.tournamentWins;

				// Update HTML content
				document.getElementById('gamesPlayed').innerText = gamesPlayed;
				document.getElementById('wins').innerText = wins;
				document.getElementById('losses').innerText = losses;
				document.getElementById('tournamentWins').innerText = tournamentWins;
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    });
});
