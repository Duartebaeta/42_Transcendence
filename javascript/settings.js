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

// Submit New Avatar
document.addEventListener("DOMContentLoaded", function() {
    const settingsAvatarInput = document.getElementById('settingsAvatarImg');
    const settingsAvatarBtn = document.getElementById('settingsAvatarBtn');

	// Change Button Name To File Name For Better Readability
    settingsAvatarInput.addEventListener('change', function () {
        const fileName = settingsAvatarInput.files[0] ? settingsAvatarInput.files[0].name : 'Change Avatar';
        settingsAvatarBtn.textContent = fileName;
    });

    settingsAvatarBtn.addEventListener('click', function() {
        const file = settingsAvatarInput.files[0];

        if (file) {
            // Create FormData Object For Avatar Img
            const formData = new FormData();
            formData.append('avatar', file);

            // Send Post Request To API With The Avatar
            fetch('API PATH', {
                method: 'POST',
                body: formData
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });
})
