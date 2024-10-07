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
		    url: 'https://localhost:8000/user/sign-in/',
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
