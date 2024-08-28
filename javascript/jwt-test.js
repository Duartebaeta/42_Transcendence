document.addEventListener('DOMContentLoaded', function() {
	let jwtBtn = document.getElementById("jwt-test-btn");

	jwtBtn.addEventListener('click', function() {
		let request = {
			method: 'GET',
			url: '',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + accessToken
			}
		}
		
		fetch(request.url, request)
		.catch(function(error) {
			// Handle errors
			console.error('Error:', error);
		});
	})
});