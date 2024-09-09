// Change button for new avatar to the name of the file
document.getElementById('avatarImg').addEventListener('change', function () {
	var fileName = this.files[0].name;
	var nextSibling = this.nextElementSibling;
	nextSibling.innerText = fileName;
});

// Clear input fields
document.addEventListener("DOMContentLoaded", function() {
	let password = document.getElementById('newPassword');

	password.addEventListener('submit', function(e) {
		e.preventDefault();
		let passwordInput = document.getElementById('newPasswordInput')

		var request = {
		    method: 'POST', // HTTP method
		    url: 'http://127.0.0.1:8000/user/change-password/',
		    headers: {
		        'Content-Type': 'application/json',
		    },
			body: JSON.stringify({ // Convert data to JSON string
		        new_password: passwordInput.value
		    })
		};

		authenticatedRequest(request.url, request) // TODO: change endpoint url
		.then(response => response.json())
		.then(data => console.log(data))
		.catch(error => console.error('Request failed', error));
	})
});
