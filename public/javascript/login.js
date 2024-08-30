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
			} else {
				throw new Error('Network response was not ok');
			}
		})
		.then(function(data) {
			// data now contains the parsed JSON
			console.log(data); // Log the JSON data
			
			const accessToken = data.access_token;
			const refreshToken = data.refresh_token;

			// Store Tokens (Local Storage)
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);

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
