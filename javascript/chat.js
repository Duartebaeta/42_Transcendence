// Clear Chat Window After Leaving Chat Modal
document.addEventListener('DOMContentLoaded', function() {
	const chatModal = document.getElementById('chat-modal');
	
	chatModal.addEventListener('hidden.bs.modal', function() {
		let	chatLogs = document.getElementById('chat-messages');

		chatLogs.innerHTML = "";
		document.getElementById('selectedContactName').innerHTML = "";
	});
})

// Handle Contacts, Chat Logs And New Messages
document.addEventListener('DOMContentLoaded', function() {
	const chatModal = document.getElementById('chat-modal');
	const chatWindow = document.getElementById('chat-messages');
	const contactsWindow = document.getElementById('contacts');
	const chatBtn = document.getElementById('chatBtn');

	let socket;
	let activeContactId = null;

	// Fetch And Display Contacts When Chat Button Is Clicked
	chatBtn.addEventListener('click', function() {
		// Send The Request Using Fetch API
		fetch("chat-contacts.json")
			.then(response => response.json())
			.then(data => {
				const contacts = data.contacts;
				
				// Create HTML Content For Contacts
				let info = '';
				contacts.forEach(contact => {
					info += `<div class="contactArea d-flex align-items-start align-items-center ps-4" data-contact-id="${contact.id}">
								<i class="bi bi-person-square text-light" style="font-size: 55px;"></i> <!-- Profile Picture -->
								<div class="ms-3" style="width: 210px;">
									<h4 class="text-light mb-1 text-truncate">${contact.name}</h4>
									<p class="text-light mb-0 text-truncate">${contact.lastMessage}</p>
								</div>
								<div class="dropdown ms-auto">
									<button class="btn dropdown-toggle align-items-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
										<i class="bi bi-three-dots-vertical h4 text-light"></i>
									</button>
									<!-- Dropdown Menu -->
									<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
										<!-- Menu Options -->
										<li><a class="dropdown-item" href="#" data-value="Block">Block</a></li>
										<li><a class="dropdown-item" href="#" data-value="Invite To Play">Invite To Play</a></li>
										<li><a class="dropdown-item" href="#" data-value="Profile">Profile</a></li>
									</ul>
									<select class="custom-select" id="hiddenSelect">
										<option value="Block">Block</option>
										<option value="Invite To Play">Invite To Play</option>
										<option value="Profile">Profile</option>
									</select>
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

	// Event to open messages with target contact
	document.getElementById('contacts').addEventListener('click', function(event) {
		const contactArea = event.target.closest('.contactArea');
		if (contactArea) {
			const contactId = contactArea.getAttribute('data-contact-id');
			activeContactId = contactId; // Set The Active Contact ID

			// Send The Request Using Fetch API
			fetch(`chat-logs-test/chat-messages-${contactId}.json`)
				.then(response => response.json())
				.then(data => {
					let info = '';

					// Check If Chat With Contact Has Previous Messages
					if (!data.messages) {
						info += `<div class="text-center text-light pt-3">
									<h5>No messages with this person yet!</h3>
								</div>`;
					}
					else {
						const chat = data.messages;

						// Create HTML Chat Logs Content
						chat.forEach(message => {
							if (!message.fromOtherUser)
								info += `<div class="text-light bg-secondary p-2 rounded ms-auto text-start mb-2 px-3" style="max-width: 70%; word-wrap: break-word;">${message.message}</div>`;
							else
								info += `<div class="text-dark p-2 rounded me-auto text-start mb-2 px-3" style="background-color: orange; max-width: 70%; word-wrap: break-word;">${message.message}</div>`;
						});
					}

					// Update HTML Content
					document.getElementById('selectedContactName').innerHTML = data.contactName;
					document.getElementById('chat-messages').innerHTML = info;

					// Scroll To Bottom Of Chat Window
					chatWindow.scrollTop = chatWindow.scrollHeight;
				})
				.catch(error => {
					console.error("Error fetching data:", error);
				});
		}
	});

	// Establish WebSocket connection
	const chatRoomName = 'chat-room-name'; // Replace Chat Room Name

	// Create WebSocket
	socket = new WebSocket('ws://' + window.location.host + '/ws/' + chatRoomName + '/');

	// Send Data When Connection Is Established
	socket.onopen = function() {
		const sendBtn = document.getElementById('sendMessagesBtn');

		sendBtn.addEventListener('click', function() {
			const message = document.getElementById('messageTextArea').value;

			const payload = {
				contactId: activeContactId,
				message: message
			};

			socket.send(JSON.stringify(payload));
		});
	};

	// Receive Data From	 WebSocket
	socket.onmessage = function(event) {
		try {
			const data = JSON.parse(event.data);

			if (data.contactId === activeContactId) {
				const message = data.message;
				let messageHtml = '';

				if (data.fromOtherUser) {
					messageHtml = `<div class="text-dark p-2 rounded me-auto text-start mb-2 px-3" style="background-color: orange; max-width: 70%; word-wrap: break-word;">${message}</div>`;
				}
				else {
					messageHtml = `<div class="text-light bg-secondary p-2 rounded ms-auto text-start mb-2 px-3" style="max-width: 70%; word-wrap: break-word;">${message}</div>`;
				}

				document.getElementById('chat-messages').innerHTML += messageHtml;
				chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll To Bottom Of Chat Window
			}
		}
		catch (error) {
			console.error("Error parsing JSON data:", error);
		}
	};

	socket.onclose = function() {
		console.log("Connection Closed");
	};
});


// document.addEventListener('DOMContentLoaded', function() {
// 	const chatModal = document.getElementById('chat-modal');
// 	const chatWindow = document.getElementById('chat-messages');
// 	const contactsWindow = document.getElementById('contacts');
// 	const chatBtn = document.getElementById('chatBtn');

// 	chatBtn.addEventListener('click', function() {
// 		// Send the request using Fetch API
// 		fetch("chat-contacts.json")
// 			.then(response => response.json())
// 			.then(data => {
// 				const contacts = data.contacts;
				
// 				// Create HTML Content For Contacts
// 				let info = '';
// 				contacts.forEach(contact => {
// 					info += `<div class="contactArea d-flex align-items-start align-items-center ps-4" data-contact-id="${contact.id}">
// 								<i class="bi bi-person-square text-light" style="font-size: 55px;"></i> <!-- Profile Picture -->
// 								<div class="ms-3" style="width: 210px;">
// 									<h4 class="text-light mb-1 text-truncate">${contact.name}</h4>
// 									<p class="text-light mb-0 text-truncate">${contact.lastMessage}</p>
// 								</div>
// 								<div class="dropdown ms-auto">
// 									<button class="btn dropdown-toggle align-items-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
// 										<i class="bi bi-three-dots-vertical h4 text-light"></i>
// 									</button>
// 									<!-- Dropdown Menu -->
// 									<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
// 										<!-- Menu Options -->
// 										<li><a class="dropdown-item" href="#" data-value="Block">Block</a></li>
// 										<li><a class="dropdown-item" href="#" data-value="Invite To Play">Invite To Play</a></li>
// 										<li><a class="dropdown-item" href="#" data-value="Profile">Profile</a></li>
// 									</ul>
// 									<select class="custom-select" id="hiddenSelect">
// 										<option value="Block">Block</option>
// 										<option value="Invite To Play">Invite To Play</option>
// 										<option value="Profile">Profile</option>
// 									</select>
// 								</div>
// 							</div>`;
// 				});

// 				// Update HTML Content
// 				document.getElementById('chatContacts').innerHTML = info;
// 			})
// 			.catch(error => {
// 				console.error("Error fetching data:", error);
// 			});
// 	});

// 	// Event To Open Messages With Target Contact
// 	document.getElementById('contacts').addEventListener('click', function(event) {
// 		const contactArea = event.target.closest('.contactArea');
// 		if (contactArea) {
// 			const contactId = contactArea.getAttribute('data-contact-id');
// 			// Send the request using Fetch API
// 			fetch(`chat-logs-test/chat-messages-${contactId}.json`)
// 				.then(response => response.json())
// 				.then(data => {
// 					let info = '';

// 					// Check If Chat With Contact Has Previous messages
// 					if (!data.messages) {
// 						info += `<div class="text-center text-light pt-3">
// 									<h5>No messages with this person yet!</h3>
// 								</div>`
// 					}
// 					else {
// 						const chat = data.messages;
	
// 						// Create HTML Chat Logs Content
// 						chat.forEach(message => {
// 							if (!message.fromOtherUser)
// 								info += `<div class="text-light bg-secondary p-2 rounded ms-auto text-start mb-2 px-3" style="max-width: 70%; word-wrap: break-word;">${message.message}</div>`;
// 							else
// 								info += `<div class="text-dark p-2 rounded me-auto text-start mb-2 px-3" style="background-color: orange; max-width: 70%; word-wrap: break-word;">${message.message}</div>`;
// 						});
// 					}

// 					// Update HTML Content
// 					document.getElementById('selectedContactName').innerHTML = data.contactName;
// 					document.getElementById('chat-messages').innerHTML = info;

// 					// Scroll To Bottom Of Chat Window
// 					chatWindow.scrollTop = chatWindow.scrollHeight;
// 				})
// 				.catch(error => {
// 					console.error("Error fetching data:", error);
// 				});
// 		}
// 	});

// 	// Set Scrolls To Initial Positions
// 	chatModal.addEventListener('shown.bs.modal', function() {
// 		chatWindow.scrollTop = chatWindow.scrollHeight;
// 		contactsWindow.scrollTop = 0;
// 	});
// });

// // Send Message
// document.addEventListener('DOMContentLoaded', function() {
// 	const sendMessageBtn = document.getElementById('sendMessageBtn');

// 	sendMessageBtn.addEventListener('click', function() {
// 		var message = {
// 		    method: 'POST', // HTTP method
// 		    url: 'http://127.0.0.1:8000/user/signup/',
// 		    headers: {
// 		        'Content-Type': 'application/json' 
// 		    },
// 		    body: JSON.stringify({ // Convert data to JSON string
// 				message: document.getElementById('messageTextArea').value
// 		    })
// 		};

// 		// Send Message To API
// 		fetch('API-URL', message)
// 			.catch(function(error) {
// 				console.error('Error', error);
// 			})
// 	})
// })
