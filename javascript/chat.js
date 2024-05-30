// Set chat scroll to bottom
document.addEventListener("DOMContentLoaded", function() {
	const chatModal = document.getElementById('chat-modal');
	const chatWindow = document.getElementById('chat-messages');

	chatModal.addEventListener('shown.bs.modal', function() {
		chatWindow.scrollTop = chatWindow.scrollHeight;
		console.log(chatWindow.scrollHeight);
	});
});
