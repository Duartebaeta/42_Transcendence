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

	registerRequestBtn.addEventListener('submit', async function(e) {
		e.preventDefault();

		// Retrieve username, email, and password inputs
		var usernameInput = document.getElementById('registerUsername');
		var emailInput = document.getElementById('registerEmail');
		var passwordInput = document.getElementById('registerPassword');

		try {
			// Get the base64 avatar using await
			let avatarBase64 = await getRegisterAvatar();

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
					password: passwordInput.value,
					avatar: avatarBase64 // Send the base64 avatar data
				})
			};

			console.log(request.body);
			// Send the request using Fetch API
			let response = await fetch(request.url, request);

			if (response.ok) {
				// If response status is 200 OK, hide the modal
				var myModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
				myModal.hide();
				myModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
				myModal.show()
			} else {
				// If response status is not OK, show error message
				let data = await response.json();
				let firstErrorMessage = data.errors[0];
				document.getElementById('registerErrorMessage').innerText = firstErrorMessage;
				document.getElementById('registerErrorMessage').style.display = 'block';
			}
		} catch (error) {
			// Handle errors
			console.error('Error:', error);
		}
	});
});

// Submit Avatar
function getRegisterAvatar() {
	return new Promise((resolve, reject) => {
		const registerAvatarInput = document.getElementById('avatarImg');
		const registerAvatarBtn = document.getElementById('avatarImg');

		let file = registerAvatarInput.files[0]; // Get the file object

		// If file does not exist, return Default
		if (!file)
			resolve("Default");

		// Update button text with the file name
		let fileName = file ? file.name : 'Upload Avatar';
		registerAvatarBtn.textContent = fileName;

		let reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = function () {
			let base64String = reader.result;
			resolve(base64String); // Resolve with the base64 string
		};

		reader.onerror = function (error) {
			console.error('Error reading file:', error);
			reject(error); // Reject the promise in case of an error
		};
	});
}

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