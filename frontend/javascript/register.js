// Clear input fields
document.addEventListener("DOMContentLoaded", function() {
	const registerbtn = document.getElementById('registerBtn');

	registerbtn.addEventListener('click', function() {
		var registerForm = document.getElementById('registerForm');

		registerForm.reset();
	});
});

// Register Request
document.addEventListener('DOMContentLoaded', function() {
	const registerRequestBtn = document.getElementById('registerForm');

	registerRequestBtn.addEventListener('submit', function(e) {
		e.preventDefault();
		// Retrieve email and password inputs
		var usernameInput = document.getElementById('registerUsername');
		var emailInput = document.getElementById('registerEmail');
		var passwordInput = document.getElementById('registerPassword');

		// Construct the request object
		var request = {
			method: 'POST', // HTTP method
			url: 'http://127.0.0.1:8000/user/sign-up/',
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
					myModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
					myModal.show()
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

// Show Password Button at Register
document.addEventListener("DOMContentLoaded", function() {
	const showPasswordBtn = document.getElementById('showPasswordBtnRegister');
	showPasswordBtn.checked = false;

	showPasswordBtn.addEventListener('click', function() {
		const passwordInput = document.getElementById('registerPassword');
		
		if (showPasswordBtn.checked === true)
			passwordInput.setAttribute('type', 'text');
		else
			passwordInput.setAttribute('type', 'password');
	})	
});
