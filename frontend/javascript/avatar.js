// Convert avatar to base64
function getAvatarBase64(input, btn) {
	return new Promise((resolve, reject) => {
		let file = input.files[0]; // Get the file object

		// If file does not exist, return Default avatar
		if (!file) {
			const imageUrl = './defaultAvatar.png';
			
			fetch(imageUrl)
			.then(response => response.blob()) // Convert the response to a Blob
			.then(blob => {
				const reader = new FileReader();
				reader.readAsDataURL(blob);
				
				reader.onload = function() {
					const defaultAvatar = reader.result;
					resolve(defaultAvatar);
				};
			})
			.catch(error => {
				console.error('Error fetching the image:', error);
			});
			return;
		}

		// Update button text with the file name
		// input.addEventListener('change', function () {
		// 	if (input.files && input.files.length > 0) {
		// 		btn.textContent = input.files[0].name;
		// 	}
		// });

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

function changeAvatarBtnName(input, btn) {
	input.addEventListener('change', function () {
		if (input.files && input.files.length > 0) {
			btn.textContent = input.files[0].name;
		}
	});
}