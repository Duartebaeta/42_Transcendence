document.getElementById('avatarImg').addEventListener('change', function () {
	var fileName = this.files[0].name;
	var nextSibling = this.nextElementSibling;
	nextSibling.innerText = fileName;
});
