let chatSocket;
let isChatting = false;
let isFriend = false;

// Clear Chat Window After Leaving Chat Modal
document.addEventListener('DOMContentLoaded', function () {
	const chatModal = document.getElementById('chat-modal');

	chatModal.addEventListener('hidden.bs.modal', function () {
		document.getElementById('chat-messages').innerHTML = '';
		document.getElementById('chatDropdownMenu').classList.add('d-none');
		document.getElementById('onlineStatus').innerText = '';
		document.getElementById('selectedContactName').innerHTML = "";
		isChatting = false;
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
			url: 'https://10.12.244.159/rooms/user/',
			headers: {
				'Content-Type': 'application/json',
			}
		};

		// Send The Request Using Fetch API
		authenticatedRequest(request.url, request)
		.then(response => response.json())
		.then(data => {
			console.log(data)
			const contacts = data.contacts;
			const friends = data.friends;
			// Create HTML Content For Contacts
			let info = '';
			let friendsInfo = "";
			contacts.forEach(contact => {
				info += `<div class="contactArea d-flex align-items-start align-items-center ps-4" data-contact-id="${contact.name}">
							<i class="bi bi-person-square text-light" style="font-size: 55px;"></i> <!-- Profile Picture -->
							<div class="ms-3" style="width: 210px;">
								<h4 class="text-light mb-1 text-truncate">${contact.name}</h4>
								<p class="text-light mb-0 text-truncate">${contact.last_message}</p>
							</div>
						</div>`;
			});

			let friendsList = '';
			friends.forEach(friend => {
				friendsInfo += `<div class="contactArea d-flex align-items-start align-items-center ps-4" data-contact-id="${friend.name}">
							<i class="bi bi-person-square text-light" style="font-size: 55px;"></i> <!-- Profile Picture -->
							<div class="ms-3" style="width: 210px;">
								<h4 class="text-light mb-1 text-truncate">${friend.name}</h4>
								<p class="text-light mb-0 text-truncate">${friend.last_message}</p>
							</div>
						</div>`;
			});

			// Update HTML Content
			document.getElementById('chatContacts').innerHTML = info;
			document.getElementById('friendsContacts').innerHTML = friendsInfo;
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});
	});
});

// Fetch And Display Messages With Selected Contact
document.addEventListener('DOMContentLoaded', function () {
	const chatWindow = document.getElementById('chat-messages');

	document.getElementById('contacts').addEventListener('click', function (event) {
		const contactArea = event.target.closest('.contactArea');

		if (contactArea) {
			isChatting = true;
			const contactId = contactArea.getAttribute('data-contact-id');
			const dropdownBtn = document.getElementById('dropdownMenuButton');

			chatDropdownMenu.classList.remove('d-none');

			// Close previous WebSocket connection if any
			if (chatSocket) {
				chatSocket.close();
			}

			// Fetch room details
			var request = {
				method: 'POST',
				url: 'https://10.12.244.159/rooms/chatroom/',
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

					if (data.friend == true) {
						isFriend = true;
						if (data.online_status == true)
							document.getElementById('onlineStatus').innerText = '(Online)';
						else
							document.getElementById('onlineStatus').innerText = '(Offline)';	
					}
					else {
						isFriend = false;
						document.getElementById('onlineStatus').innerText = '';	
					}


					// Display previous messages if any
					const chat = data.messages;
					chat.forEach(message => {
						info += renderMessage(message.message, (message.user != contactId));
					});

					// Update the chat window with previous messages
					document.getElementById('selectedContactName').innerHTML = contactId;
					document.getElementById('chat-messages').innerHTML = info;

					// Scroll to the bottom of the chat
					chatWindow.scrollTop = chatWindow.scrollHeight;

					// Establish WebSocket connection for the current room
					chatSocket = new WebSocket(
						'wss://10.12.244.159' + '/ws/chat/' + roomName + '/'
					);

					// Handle incoming messages from WebSocket
					chatSocket.onmessage = function (e) {
						const data = JSON.parse(e.data);
						if (data.message) {
							let messageHTML = renderMessage(data.message, (data.username != contactId));
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
		const contacts = document.getElementById('chatContacts');
		const friends = document.getElementById('friendsContacts');

		if (btn.style.backgroundColor == 'rgba(220, 220, 220, 0.3)') {
			btn.style.backgroundColor = 'rgba(238, 130, 238, 1)';
			contacts.classList.add('d-none');
			friends.classList.remove('d-none');
		}
		else {
			btn.style.backgroundColor = 'rgba(220, 220, 220, 0.3)';
			contacts.classList.remove('d-none');
			friends.classList.add('d-none');
		}
	});
});

document.addEventListener('DOMContentLoaded', function () {
    const dropdownMenu = document.getElementById('chatDropdownMenu');
    
    // Initialize modals once
    const playerStatsModal = new bootstrap.Modal(document.getElementById('stats-modal'));
    const chatModal = new bootstrap.Modal(document.getElementById('chat-modal'));

    dropdownMenu.addEventListener('click', function() {
        const selectedValue = event.target.getAttribute('data-value');
		const username = document.getElementById('selectedContactName').innerText;

        if (selectedValue === 'Profile') {

			let request = {
				method: 'POST',
				url: 'https://10.12.244.159/user-stats/stats/',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: username
				})
			};

			authenticatedRequest(request.url, request)
			.then(response => response.json())
			.then(data => {
				// Parse JSON data
				const username = data.username;
				const gamesPlayed = data.gamesPlayed;
				const wins = data.wins;
				const losses = data.losses;
				const tournamentWins = data.tournamentWins;	
				const points = data.points;
				const avatar = data.avatar;

				// Update HTML content
				document.getElementById('playerStatsUsername').innerText = username;
				document.getElementById('gamesPlayed').innerText = gamesPlayed;
				document.getElementById('wins').innerText = wins;
				document.getElementById('losses').innerText = losses;
				document.getElementById('tournamentWins').innerText = tournamentWins;
				document.getElementById('playerStatsAvatar').src = avatar;
				// Draw points graph
				if (!points)
					drawGraph([0, 0, 0, 0, 0, 0, 0]);
				else
					drawGraph(points);
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});

			chatModal.hide();
			playerStatsModal.show();
        }
		else if (selectedValue === 'Block') {
			let request = {
				method: 'POST',
				url: 'https://10.12.244.159/rooms/block/',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: username
				})
			};

			authenticatedRequest(request.url, request)
			.catch(error => {
				console.error("Error blocking user:", error);
			});
		}
		else if (selectedValue === 'Friend') {
			let request = {
				method: 'POST',
				url: 'https://10.12.244.159/rooms/friend/',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: username
				})
			};

			authenticatedRequest(request.url, request)
			.then(response => {
				if (response.status == 409) {
					request = {
						method: 'DELETE',
						url: 'https://10.12.244.159/rooms/friend/',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							user: username
						})
					};

					return authenticatedRequest(request.url, request);
				}
			})
			.catch(error => {
				console.error("Error adding user as friend:", error);
			});
		}
		else if (selectedValue === 'Invite') {
			let gameManagerSocket = new WebSocket('wss://10.12.244.159/ws/gamebackend/GameManager/');
			let gameId

			const request = {
				type: 'create_game',
			};
			gameManagerSocket.onopen = function () {
				console.log('Connected to GameManager');
				gameManagerSocket.send(JSON.stringify(request));
			};

			gameManagerSocket.onmessage = function (event) {
				const data = JSON.parse(event.data);
				if (data.type == 'game_created') {
					gameId = data.gameID;

					const message = {
						type: 'change_group',
						game_id: data.gameID,
						group_name: 'game_manager_' + data.gameID
					};
					gameManagerSocket.send(JSON.stringify(message));

					let request = {
						method: 'POST',
						url: 'https://10.12.244.159/rooms/invite/',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							username: username,
							game_id: gameId
						})
					};

					authenticatedRequest(request.url, request)
					.catch(error => {
						console.error("Error inviting to a game:", error);
					})

					chatModal.hide();
					startGame(data.gameID);
				}
			}	
		}
    });
});

function getClosedUsers(username) {
	if (isChatting == true && isFriend == true) {
		const contactName = document.getElementById('selectedContactName').innerText;

		if (contactName === username){
			document.getElementById('onlineStatus').innerText = '(Offline)';
		}
	}
}

function getOnlineUsers(username) {
	console.log(isChatting)
	console.log(isFriend)
	if (isChatting == true && isFriend == true) {
		console.log('user got online')
		const contactName = document.getElementById('selectedContactName').innerText;

		if (contactName === username){
			document.getElementById('onlineStatus').innerText = '(Online)';
		}
	}
}
