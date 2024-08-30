// Change button for new avatar to the name of the file
document.getElementById('avatarImg').addEventListener('change', function () {
	var fileName = this.files[0].name;
	var nextSibling = this.nextElementSibling;
	nextSibling.innerText = fileName;
});

// Clear input fields
document.addEventListener("DOMContentLoaded", function() {
	const settingsBtn = document.getElementById('settingsBtn');

	settingsBtn.addEventListener('click', function() {
		var newUsername = document.getElementById('newUsername');
		var newPassword = document.getElementById('newPassword');

		newUsername.value = '';
		newPassword.value = '';
	});
});
