// Convert avatar to base64
function getAvatarBase64() {
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

