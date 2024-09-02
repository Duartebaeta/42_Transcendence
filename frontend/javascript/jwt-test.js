document.addEventListener('DOMContentLoaded', function() {
	let jwtBtn = document.getElementById("jwt-test-btn");

	jwtBtn.addEventListener('click', function() {
		authenticatedRequest('http://127.0.0.1:8000/user/sign-in/') // TODO: change endpoint url
		.then(response => response.json())
		.then(data => console.log(data))
		.catch(error => console.error('Request failed', error));
	})
});