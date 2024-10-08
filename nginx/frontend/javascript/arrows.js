document.addEventListener("DOMContentLoaded", function() {
    const statsModal = new bootstrap.Modal(document.getElementById('stats-modal'));
    const chatModal = new bootstrap.Modal(document.getElementById('chat-modal'));
    const matchHistoryModal = new bootstrap.Modal(document.getElementById('match-history-modal'));
    const settingsModal = new bootstrap.Modal(document.getElementById('settings-modal'));

    const statsBtn = document.getElementById("statsBtn");
    const chatBtn = document.getElementById("chatBtn");
    const matchHistoryBtn = document.getElementById("matchHistoryBtn");
    const settingsBtn = document.getElementById("settingsBtn");

    // Open modal and update URL when the corresponding button is clicked
    statsBtn.addEventListener("click", function() {
        openModal('stats-modal');
    });

    chatBtn.addEventListener("click", function() {
        openModal('chat-modal');
    });

    matchHistoryBtn.addEventListener("click", function() {
        openModal('match-history-modal');
    });

    settingsBtn.addEventListener("click", function() {
        openModal('settings-modal');
    });

    // Handle back and forward navigation
    window.onpopstate = function(event) {
        const modalId = event.state && event.state.modal;
        if (modalId) {
            showModal(modalId);
        } else {
            closeAllModals();
        }
    };

    function openModal(modalId) {
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();

        // Push the state to history
        history.pushState({ modal: modalId }, null, `/${modalId}`);
    }

    function showModal(modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }

    function closeAllModals() {
        // Close all modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(function(modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        });
    }

	window.addEventListener("load", function() {
		const currentPath = window.location.pathname;
		if (currentPath !== '/') {
			showModal(currentPath.substring(1));  // Strip the '/' and pass to showModal
		}
	});
	
    // When modals are closed, make sure to pop state (go back in history)
    const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            history.back(); // This will trigger the popstate event
        });
    });
});
