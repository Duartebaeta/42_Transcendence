// Clear Chat Window After Leaving Chat Modal
document.addEventListener('DOMContentLoaded', function () {
	const chatModal = document.getElementById('chat-modal');

	chatModal.addEventListener('hidden.bs.modal', function () {
		let chatLogs = document.getElementById('chat-messages');

		chatLogs.innerHTML = "";
		document.getElementById('selectedContactName').innerHTML = "";
		document.getElementById('chatDropdownMenu').innerHTML = "";
	});
})

// Set Scroll Of Contacts And Chat Windows To Starting Positions
document.addEventListener('DOMContentLoaded', function () {
	const chatModal = document.getElementById('chat-modal');
	const chatWindow = document.getElementById('chat-messages');
	const contactsWindow = document.getElementById('contacts');

	chatModal.addEventListener('shown.bs.modal', function () {
		chatWindow.scrollTop = chatWindow.scrollHeight;
		contactsWindow.scrollTop = 0;
	});
})

// Fetch And Display Existing Contacts
document.addEventListener('DOMContentLoaded', function () {
	const chatBtn = document.getElementById('chatBtn');

	// Fetch And Display Contacts When Chat Button Is Clicked
	chatBtn.addEventListener('click', function () {

		var request = {
			method: 'GET', // HTTP method
			url: 'http://localhost:9000/rooms/user/',
			headers: {
				'Content-Type': 'application/json',
			}
		};

		// Send The Request Using Fetch API
		authenticatedRequest(request.url, request)
			.then(response => response.json())
			.then(data => {
				const contacts = data.contacts;
				console.log(data.contacts);

				// Create HTML Content For Contacts
				let info = '';
				contacts.forEach(contact => {
					info += `<div class="contactArea d-flex align-items-start align-items-center ps-4" data-contact-id="${contact.name}">
								<i class="bi bi-person-square text-light" style="font-size: 55px;"></i> <!-- Profile Picture -->
								<div class="ms-3" style="width: 210px;">
									<h4 class="text-light mb-1 text-truncate">${contact.name}</h4>
									<p class="text-light mb-0 text-truncate">${contact.last_message}</p>
								</div>
							</div>`;
				});

				// Update HTML Content
				document.getElementById('chatContacts').innerHTML = info;
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});
	});
});

// Fetch And Display Messages With Selected Contact
document.addEventListener('DOMContentLoaded', function () {
	const chatWindow = document.getElementById('chat-messages');
	let chatSocket;

	document.getElementById('contacts').addEventListener('click', function (event) {
		const contactArea = event.target.closest('.contactArea');

		if (contactArea) {
			const contactId = contactArea.getAttribute('data-contact-id');

			// Close previous WebSocket connection if any
			if (chatSocket) {
				chatSocket.close();
			}

			// Fetch room details
			var request = {
				method: 'POST',
				url: 'http://localhost:9000/rooms/chatroom/',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ user: contactId })
			};

			// Send the request to get the chat room
			authenticatedRequest(request.url, request)
				.then(response => response.json())
				.then(data => {
					const roomName = data.name;
					let info = '';

					// Display previous messages if any
					const chat = data.messages;
					chat.forEach(message => {
						info += renderMessage(message.message, message.fromOtherUser);
					});

					// Update the chat window with previous messages
					document.getElementById('selectedContactName').innerHTML = contactId;
					document.getElementById('chat-messages').innerHTML = info;

					// Scroll to the bottom of the chat
					chatWindow.scrollTop = chatWindow.scrollHeight;

					// Establish WebSocket connection for the current room
					chatSocket = new WebSocket(
						'ws://localhost:9000' + '/ws/' + roomName + '/'
					);

					// Handle incoming messages from WebSocket
					chatSocket.onmessage = function (e) {
						const data = JSON.parse(e.data);
						if (data.message) {
							let messageHTML = renderMessage(data.message, !data.fromOtherUser);
							document.getElementById('chat-messages').innerHTML += messageHTML;

							// Scroll to bottom after new message
							chatWindow.scrollTop = chatWindow.scrollHeight;
						}
					};

					chatSocket.onclose = function (e) {
						console.log('WebSocket connection closed');
					};


					// Send message via WebSocket when send button is clicked
					document.getElementById('sendMessagesBtn').addEventListener('click', function () {
						const messageInput = document.getElementById('messageTextArea');
						const message = messageInput.value;


						chatSocket.onclose = function (e) {
							throw (console.log('WebSocket connection closed 1'));
						};

						console.log(message)
						console.log(contactId)
						console.log(roomName)

						if (message.trim()) {
							chatSocket.send(JSON.stringify({
								'message': message,
								'username': contactId,  // Replace with actual user info if needed
								'room': roomName
							}));
							messageInput.value = ""; // Clear input field

							chatSocket.onclose = function (e) {
								throw (console.log('WebSocket connection closed 2'));
							};
						}
					});
				})
				.catch(error => {
					console.error("Error fetching data:", error);
				});
		}
	});
});

// Helper function to render chat messages
function renderMessage(message, fromOtherUser) {
	return fromOtherUser
		? `<div class="text-dark p-2 rounded me-auto text-start mb-2 px-3" style="background-color: orange; max-width: 70%; word-wrap: break-word;">${message}</div>`
		: `<div class="text-light bg-secondary p-2 rounded ms-auto text-start mb-2 px-3" style="max-width: 70%; word-wrap: break-word;">${message}</div>`;
}

// Show friends only button
document.addEventListener('DOMContentLoaded', function () {
	const btn = document.getElementById('friendsOnlyBtn');

	btn.addEventListener('click', function () {
		if (btn.style.backgroundColor == 'rgba(220, 220, 220, 0.3)') // TODO: add code to toggle friends only
			btn.style.backgroundColor = 'rgba(238, 130, 238, 1)';
		else
			btn.style.backgroundColor = 'rgba(220, 220, 220, 0.3)';
	});
});
