// Login Modal Trigger
document.addEventListener('DOMContentLoaded', function() {
	var myModal = new bootstrap.Modal(document.getElementById('login-modal'));
	myModal.show();
});

// Get Player Stats from JSON file
document.addEventListener("DOMContentLoaded", function() {
    const updateButton = document.getElementById("statsBtn");

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

document.addEventListener('DOMContentLoaded', function() {
    // Get a reference to the button element
    var loginRequestBtn = document.getElementById('loginRequestBtn');

    // Add event listener to the button for the 'click' event
    loginRequestBtn .addEventListener('click', function() {
        // Construct the request object
        // var request = {
        //     method: 'POST', // HTTP method
        //     url: 'https://example.com/api/endpoint', // API endpoint URL
        //     headers: {
        //         'Content-Type': 'application/json', // Set content type to JSON
        //         // Add any additional headers if needed
        //     },
        //     body: JSON.stringify({ // Convert data to JSON string
        //         key1: 'value1',
        //         key2: 'value2'
        //         // Add any data you want to send in the request body
        //     })
        // };

        // Send the request using Fetch API
		fetch("login-check.json")
			.then(function(response) {
				//  Check if response status is OK (optional)
				if (response.ok) {
				    // If response status is 200 OK, hide the modal
				    var myModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
				    myModal.hide();
				}
				else {
					// If response status is not OK, show error message
					response.json().then(function(data) {
							var firstErrorMessage = data.errors[0];

							document.getElementById('loginErrorMessage').innerText = firstErrorMessage;
							document.getElementById('loginErrorMessage').style.display = 'block';
					})
					.catch(function(error) {
					    // Handle errors
					    console.error('Error:', error);
					});
				}
			});
	});
});

document.addEventListener('DOMContentLoaded', function() {
    // Get a reference to the button element
    var loginRequestBtn = document.getElementById('registerRequestBtn');

    // Add event listener to the button for the 'click' event
    registerRequestBtn.addEventListener('click', function() {
        // Retrieve email and password inputs
		var usernameInput = document.querySelector('input[type="username"]');
        var emailInput = document.querySelector('input[type="email"]');
        var passwordInput = document.querySelector('input[type="email-password"]');

		console.log(emailInput.value);
        // Construct the request object
        var request = {
            method: 'POST', // HTTP method
            url: 'http://127.0.0.1:8000/user/signup/',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ // Convert data to JSON string
				username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            })
        };

        // Send the request using Fetch API
        fetch(request.url, request)
			.then(function(response) {
				// Check if response status is OK
				if (response.ok) {
					// If response status is 200 OK, hide the modal
					var myModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
					myModal.hide();
				}
				else {
					// If response status is not OK, show error message
					response.json().then(function(data) {
							var firstErrorMessage = data.errors[0];

							document.getElementById('registerErrorMessage').innerText = firstErrorMessage;
							document.getElementById('registerErrorMessage').style.display = 'block';
						})
					.catch(function(error) {
						// Handle errors
						console.error('Error:', error);
					});
				}
			});
    });
});
