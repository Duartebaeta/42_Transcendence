// Login Modal Trigger
document.addEventListener('DOMContentLoaded', function() {
	var myModal = new bootstrap.Modal(document.getElementById('login-modal'));
	myModal.show();
});

// Login Request
document.addEventListener('DOMContentLoaded', function() {
	// Get a reference to the button element
	const loginRequestBtn = document.getElementById('loginForm');

	// Add event listener to the button for the 'click' event
	loginRequestBtn.addEventListener('submit', function(e) {
		e.preventDefault();
		// Retrieve email and password inputs
		var emailInput = document.getElementById('loginEmail');
		var passwordInput = document.getElementById('loginPassword');

		// // Construct the request object
		var request = {
		    method: 'POST', // HTTP method
		    url: 'http://127.0.0.1:8000/user/sign-in/',
		    headers: {
		        'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({ // Convert data to JSON string
		        email: emailInput.value,
		        password: passwordInput.value
		    })
		};

		// Send the request using Fetch API
		fetch(request.url, request)
		.then(function(response) {
			if (response.ok) {
				return response.json(); // Parse the JSON here and return the promise
			}
			else {
				return response.json().then(function(errorData) {
					let errorMessage = errorData.errors[0]; // Adjust this based on your API's response structure
					console.log(errorMessage);
					document.getElementById('loginErrorMessage').innerText = errorMessage;
					document.getElementById('loginErrorMessage').style.display = 'block';
					throw new Error(errorMessage); // Throw an error to catch in the next .catch()
				});
			}
		})
		.then(function(data) {
			const accessToken = data.access_token;
			const refreshToken = data.refresh_token;

			// Store Tokens (Local Storage)
			storeTokens(accessToken, refreshToken);

			// Hide Login Modal
			var myModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
			myModal.hide();


			var request = {
				method: 'GET', // HTTP method
				url: 'http://localhost:8000/user/me/',
				headers: {
					'Content-Type': 'application/json',
				}
			};

			authenticatedRequest(request.url, request)
			.then(response => response.json())
			.then(data => {
				let id = data.id;
				let username = data.username;

				let url = 'ws://localhost:9000/ws/' + id +'/' + username + '/';
				let online_checker = new WebSocket(url);
				online_checker.onopen = function() {

				}

				online_checker.onclose = function() {

				}
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});

			let RemoteSocket = new WebSocket(`ws://localhost:9090/ws/GameManager/`);
			RemoteSocket.onopen = function() {
				console.log("Connected to login checker")
			}
			RemoteSocket.onclose = function() {
				console.log("Disconnected from login checker")
			}
		})
		.catch(function(error) {
			console.error('There was a problem with the fetch operation:', error);
		});
		
	});
});

// Show Password Button at Login
document.addEventListener("DOMContentLoaded", function() {
	const showPasswordBtn = document.getElementById('showPasswordBtnLogin');
	showPasswordBtn.checked = false;

	showPasswordBtn.addEventListener('click', function() {
		const passwordInput = document.getElementById('loginPassword');
		
		if (showPasswordBtn.checked === true)
			passwordInput.setAttribute('type', 'text');
		else
			passwordInput.setAttribute('type', 'password');
	})	
});
