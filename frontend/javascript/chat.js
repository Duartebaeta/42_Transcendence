// Set chat scroll to bottom
document.addEventListener("DOMContentLoaded", function() {
	const chatModal = document.getElementById('chat-modal');
	const chatWindow = document.getElementById('chat-messages');
	const contactsWindow = document.getElementById('contacts');

	chatModal.addEventListener('shown.bs.modal', function() {
		chatWindow.scrollTop = chatWindow.scrollHeight;
		contactsWindow.scrollTop = 0;
	});
});
