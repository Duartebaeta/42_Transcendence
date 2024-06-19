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

// API Info Request	
document.addEventListener('DOMContentLoaded', function() {
	// Get a reference to the button element
	const chatBtn = document.getElementById('chatBtn');

	// Add event listener to the button for the 'click' event
	chatBtn.addEventListener('click', function() {
		// Send the request using Fetch API
		fetch("chat.json")
			.then(response => response.json())
			.then(data => {
				const contacts = data.contacts;
				
				// Create HTML content
				let info = '';
				contacts.forEach(contact => {
					info += `<div id="contactArea" class="d-flex align-items-start align-items-center ps-4">
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
							</div>`
				});

				// Update HTML content
				document.getElementById('chatContacts').innerHTML = info;
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});
	});
});
