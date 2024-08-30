document.addEventListener('DOMContentLoaded', function() {
	let jwtBtn = document.getElementById("jwt-test-btn");

	jwtBtn.addEventListener('click', function() {
		let refreshToken = localStorage.getItem('refreshToken');
		
		let request = {
			method: 'GET',
			url: 'http://127.0.0.1:8000/user/refresh_jwt', // Replace with your actual API endpoint
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + refreshToken
			},
			body: JSON.stringify({ /* Your request payload here */ })
		}
		
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
			// const refreshToken = data.refresh_token;

			// Store Tokens (Local Storage)
			localStorage.setItem('accessToken', accessToken);
			// localStorage.setItem('refreshToken', refreshToken);

		})
		.catch(function(error) {
			console.error('There was a problem with the fetch operation:', error);
		});
	})
});