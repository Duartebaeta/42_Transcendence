// Clear Chat Window After Leaving Chat Modal
document.addEventListener('DOMContentLoaded', function() {
	const chatModal = document.getElementById('chat-modal');
	
	chatModal.addEventListener('hidden.bs.modal', function() {
		let	chatLogs = document.getElementById('chat-messages');

		chatLogs.innerHTML = "";
		document.getElementById('selectedContactName').innerHTML = "";
		document.getElementById('chatDropdownMenu').innerHTML = "";
	});
})

// Set Scroll Of Contacts And Chat Windows To Starting Positions
document.addEventListener('DOMContentLoaded', function() {
	const chatModal = document.getElementById('chat-modal');
	const chatWindow = document.getElementById('chat-messages');
	const contactsWindow = document.getElementById('contacts');

	chatModal.addEventListener('shown.bs.modal', function() {
		chatWindow.scrollTop = chatWindow.scrollHeight;
		contactsWindow.scrollTop = 0;
	});
})

// Fetch And Display Existing Contacts
document.addEventListener('DOMContentLoaded', function() {
	const chatBtn = document.getElementById('chatBtn');

	// Fetch And Display Contacts When Chat Button Is Clicked
	chatBtn.addEventListener('click', function() {
		// Send The Request Using Fetch API
		fetch("/examples/chat-contacts.json")
			.then(response => response.json())
			.then(data => {
				const contacts = data.contacts;
				console.log(data);
				
				// Create HTML Content For Contacts
				let info = '';
				contacts.forEach(contact => {
					info += `<div class="contactArea d-flex align-items-start align-items-center ps-4" data-contact-id="${contact.id}">
								<i class="bi bi-person-square text-light" style="font-size: 55px;"></i> <!-- Profile Picture -->
								<div class="ms-3" style="width: 210px;">
									<h4 class="text-light mb-1 text-truncate">${contact.name}</h4>
									<p class="text-light mb-0 text-truncate">${contact.lastMessage}</p>
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
document.addEventListener('DOMContentLoaded', function() {
	const chatWindow = document.getElementById('chat-messages');

	document.getElementById('contacts').addEventListener('click', function(event) {
		const contactArea = event.target.closest('.contactArea');
				
		if (contactArea) {
			const contactId = contactArea.getAttribute('data-contact-id');

			// Send The Request Using Fetch API
			fetch(`/examples/chat-logs-test/chat-messages-${contactId}.json`)
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
								info += `<div class="text-light bg-secondary p-2 	rounded ms-auto text-start mb-2 px-3" style="max-width: 70%; word-wrap: break-word;">${message.message}</div>`;
							else
								info += `<div class="text-dark p-2 rounded me-auto text-start mb-2 px-3" style="background-color: orange; max-width: 70%; word-wrap: break-word;">${message.message}</div>`;
						});
					}

					// Update HTML Content
					document.getElementById('selectedContactName').innerHTML = data.contactName;
					document.getElementById('chat-messages').innerHTML = info;
					// Dropmenu Settings Button
					document.getElementById('chatDropdownMenu').innerHTML = `<button class="btn dropdown-toggle align-items-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
																				<i class="bi bi-three-dots-vertical h4 text-light"></i>
																			</button>
																			<!-- Dropdown Menu -->
																			<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
																				<!-- Menu Options -->
																				<li><a class="dropdown-item" data-value="Block">Block</a></li>
																				<li><a class="dropdown-item" data-value="Invite To Play">Invite To Play</a></li>
																				<li><a class="dropdown-item" data-value="Profile">Profile</a></li>
																			</ul>
																			<select class="custom-select" id="hiddenSelect">
																				<option value="Block">Block</option>
																				<option value="Invite To Play">Invite To Play</option>
																				<option value="Profile">Profile</option>
																			</select>`

					// Scroll To Bottom Of Chat Window
					chatWindow.scrollTop = chatWindow.scrollHeight;
				})
				.catch(error => {
					console.error("Error fetching data:", error);
				});
		}
	});
})

// Establish WebSocket connection
document.addEventListener('DOMContentLoaded', function() {
	let socket;
	let activeContactId = null; // Need To Check This Functionality
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

	// Receive Data From WebSocket
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
				//chatWindow.scrollTop = chatWindow.scrollHeight; 
			}
		}
		catch (error) {
			console.error("Error parsing JSON data:", error);
		}
	};

	socket.onclose = function() {
		console.log("Connection Closed");
	};
})

// Show friends only button
document.addEventListener('DOMContentLoaded', function() {
	const btn = document.getElementById('friendsOnlyBtn');

	btn.addEventListener('click', function() {
		if (btn.style.backgroundColor == 'rgba(220, 220, 220, 0.3)') // TODO: add code to toggle friends only
			btn.style.backgroundColor = 'rgba(238, 130, 238, 1)';
		else
			btn.style.backgroundColor = 'rgba(220, 220, 220, 0.3)';
	});
});
