// Update username
document.addEventListener("DOMContentLoaded", function() {
	let password = document.getElementById('newUsername');

	password.addEventListener('submit', function(e) {
		e.preventDefault();
		let usernameInput = document.getElementById('newUsernameInput')

		var request = {
		    method: 'POST', // HTTP method
		    url: 'https://127.0.0.1:8000/user/change-username/',
		    headers: {
		        'Content-Type': 'application/json',
		    },
			body: JSON.stringify({ // Convert data to JSON string
		        new_username: usernameInput.value
		    })
		};

		authenticatedRequest(request.url, request)
		.then(response => response.json())
		.then(data => console.log(data))
		.catch(error => console.error('Request failed', error));
	})
});

// Update password
document.addEventListener("DOMContentLoaded", function() {
	let password = document.getElementById('newPassword');

	password.addEventListener('submit', function(e) {
		e.preventDefault();
		let passwordInput = document.getElementById('newPasswordInput')

		var request = {
		    method: 'POST', // HTTP method
		    url: 'https://127.0.0.1:8000/user/change-password/',
		    headers: {
		        'Content-Type': 'application/json',
		    },
			body: JSON.stringify({
		        new_password: passwordInput.value
		    })
		};

		authenticatedRequest(request.url, request)
		.then(response => response.json())
		.then(data => console.log(data))
		.catch(error => console.error('Request failed', error));
	})
});

// Update avatar
document.addEventListener('DOMContentLoaded', function () {
	try {
		const btn = document.getElementById('settingsAvatarBtn');
		const input = document.getElementById('settingsAvatar');
		const avatarSettingsBtn = document.getElementById('avatarSettingsSubmit');

		changeAvatarBtnName(input, btn);

		// Event listener for avatar submission button
		avatarSettingsBtn.addEventListener('click', async function () {
			try {
				// Get the base64 image data
				let avatarBase64 = await getAvatarBase64(input, btn);

				// Prepare the request data
				let request = {
					method: 'POST', // HTTP method
					url: 'https://127.0.0.1:8000/user/change-avatar/',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						new_avatar: avatarBase64
					}),
				};

				console.log(request.body);

				// Send the request using Fetch API
				let response = await authenticatedRequest(request.url, request);

				if (response.ok) {
					console.log("Avatar successfully changed!");
				}
				else {
					console.log("Failed to change avatar.");
				}
			} catch (error) {
				console.error('Error during avatar change:', error);
			}
		});

	} catch (error) {
		// Handle any errors
		console.error('Initialization error:', error);
	}

});

// Clear input values
document.addEventListener("DOMContentLoaded", function() {
	const settingsBtn = document.getElementById('settingsBtn');

	settingsBtn.addEventListener('click', function() {
		const changeUsername = document.getElementById('newUsername');
		const changePassword = document.getElementById('newPassword');
		const changeAvatarBtn = document.getElementById('settingsAvatarBtn');
		const changeAvatarInput = document.getElementById('settingsAvatar');

		changeUsername.reset();
		changePassword.reset();
		changeAvatarBtn.innerText = "Upload Avatar";
	});
});