document.addEventListener('DOMContentLoaded', function() {
	let jwtBtn = document.getElementById("jwt-test-btn");

	jwtBtn.addEventListener('click', function() {
		var request = {
		    method: 'POST', // HTTP method
		    url: 'http://127.0.0.1:8000/user/sign-in/',
		    headers: {
		        'Content-Type': 'application/json',
		    }
		};

		authenticatedRequest('http://127.0.0.1:8000/user/sign-in/', request) // TODO: change endpoint url
		.then(response => response.json())
		.then(data => console.log(data))
		.catch(error => console.error('Request failed', error));
	})
});	