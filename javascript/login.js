// Login Modal Trigger
document.addEventListener('DOMContentLoaded', function() {
	var myModal = new bootstrap.Modal(document.getElementById('a-modal'));
	myModal.show();
});

// Login Request
document.addEventListener('DOMContentLoaded', function() {
	// Get a reference to the button element
	const loginRequestBtn = document.getElementById('loginRequestBtn');

	// Add event listener to the button for the 'click' event
	loginRequestBtn.addEventListener('click', function() {
		// Retrieve email and password inputs
		// var emailInput = document.getElementById('loginEmail');
		// var passwordInput = document.getElementById('loginPassword');

		// // Construct the request object
		var request = {
		    method: 'POST', // HTTP method
		    url: 'http://127.0.0.1:8000/user/signup/',
		    headers: {
		        'Content-Type': 'application/json' 
		    },
		    body: JSON.stringify({ // Convert data to JSON string
		        email: emailInput.value,
		        password: passwordInput.value
		    })
		};

		// Send the request using Fetch API
		fetch("login-check.json", request)	
		.then(function(response) {
			if (response.ok) {
				// Successfully Received Tokens
				const accessToken = data.access_token;
				const refreshToken = data.refresh_token;
	
				// Store Tokens (Local Storage)
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);

				// Hide Login Modal
				var myModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
				myModal.hide();
			}
			else {
				// If Response Status is Not OK, Show Error Message
				response.json().then(function(data) {
						var firstErrorMessage = data.errors[0];

						document.getElementById('loginErrorMessage').innerText = firstErrorMessage;
						document.getElementById('loginErrorMessage').style.display = 'block';
				})
			}
		})
		.catch(function(error) {
			// Handle errors
			console.error('Error:', error);
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
