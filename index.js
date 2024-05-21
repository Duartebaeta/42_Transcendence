// Login Modal Trigger
document.addEventListener('DOMContentLoaded', function() {
	var myModal = new bootstrap.Modal(document.getElementById('login-modal'));
	myModal.show();
});

// Get Player Stats from JSON file
document.addEventListener("DOMContentLoaded", function() {
	const updateButton = document.getElementById("statsBtn");

	updateButton.addEventListener("click", function() {
		// Fetch JSON data
		fetch("player-stats.json")
			.then(response => response.json())
			.then(data => {
				// Parse JSON data
				const gamesPlayed = data.gamesPlayed;
				const wins = data.wins;
				const losses = data.losses;
				const tournamentWins = data.tournamentWins;	
				const points = data.points;
				const graph = data.graph;

				// Update HTML content
				document.getElementById('gamesPlayed').innerText = gamesPlayed;
				document.getElementById('wins').innerText = wins;
				document.getElementById('losses').innerText = losses;
				document.getElementById('tournamentWins').innerText = tournamentWins;
				drawGraph(graph); // Draw points graph
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});
	});
});

// Login Request
document.addEventListener('DOMContentLoaded', function() {
	// Get a reference to the button element
	const loginRequestBtn = document.getElementById('loginRequestBtn');

	// Add event listener to the button for the 'click' event
	loginRequestBtn.addEventListener('click', function() {
		// Retrieve email and password inputs
		// var emailInput = document.getElementById('loginEmail');
		// var passwordInput = document.getElementById('loginPassword');

		// // Construct the request object
		// var request = {
		//     method: 'POST', // HTTP method
		//     url: 'http://127.0.0.1:8000/user/signup/',
		//     headers: {
		//         'Content-Type': 'application/json' 
		//     },
		//     body: JSON.stringify({ // Convert data to JSON string
		//         email: emailInput.value,
		//         password: passwordInput.value
		//     })
		// };

		// Send the request using Fetch API
		fetch("login-check.json")
			.then(function(response) {
				//  Check if response status is OK (optional)
				if (response.ok) {
					// If response status is 200 OK, hide the modal
					var myModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
					myModal.hide();
				}
				else {
					// If response status is not OK, show error message
					response.json().then(function(data) {
							var firstErrorMessage = data.errors[0];

							document.getElementById('loginErrorMessage').innerText = firstErrorMessage;
							document.getElementById('loginErrorMessage').style.display = 'block';
					})
					.catch(function(error) {
						// Handle errors
						console.error('Error:', error);
					});
				}
			});
	});
});

// Register Request
document.addEventListener('DOMContentLoaded', function() {
	const loginRequestBtn = document.getElementById('registerRequestBtn');

	registerRequestBtn.addEventListener('click', function() {
		// Retrieve email and password inputs
		var usernameInput = document.getElementById('registerUsername');
		var emailInput = document.getElementById('registerEmail');
		var passwordInput = document.getElementById('registerPassword');

		// Construct the request object
		var request = {
			method: 'POST', // HTTP method
			url: 'http://127.0.0.1:8000/user/signup/',
			headers: {
				'Content-Type': 'application/json' 
			},
			body: JSON.stringify({ // Convert data to JSON string
				username: usernameInput.value,
				email: emailInput.value,
				password: passwordInput.value
			})
		};

		// Send the request using Fetch API
		fetch(request.url, request)
			.then(function(response) {
				// Check if response status is OK
				if (response.ok) {
					// If response status is 200 OK, hide the modal
					var myModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
					myModal.hide();
				}
				else {
					// If response status is not OK, show error message
					response.json().then(function(data) {
							var firstErrorMessage = data.errors[0];

							document.getElementById('registerErrorMessage').innerText = firstErrorMessage;
							document.getElementById('registerErrorMessage').style.display = 'block';
						})
					.catch(function(error) {
						// Handle errors
						console.error('Error:', error);
					});
				}
			});	
	});
});

// Show Password Button at Login
document.addEventListener("DOMContentLoaded", function() {
	const showPasswordBtn = document.getElementById('showPasswordBtnLogin');
	showPasswordBtn.checked = false;

	showPasswordBtn.addEventListener('click', function() {
		const passwordInput = document.getElementById('loginPassword');
		
		if (showPasswordBtn.checked === true)
			passwordInput.setAttribute('type', 'text');
		else
			passwordInput.setAttribute('type', 'password');
	})	
});

// Show Password Button at Register
document.addEventListener("DOMContentLoaded", function() {
	const showPasswordBtn = document.getElementById('showPasswordBtnRegister');
	showPasswordBtn.checked = false;

	showPasswordBtn.addEventListener('click', function() {
		const passwordInput = document.getElementById('registerPassword');
		
		if (showPasswordBtn.checked === true)
			passwordInput.setAttribute('type', 'text');
		else
			passwordInput.setAttribute('type', 'password');
	})	
});


// Draw stats graph
function drawGraph(dataArr) {  
    var canvas = document.getElementById("statsChart");
    var context = canvas.getContext("2d");

    var GRAPH_TOP = 25;
    var GRAPH_BOTTOM = 375;
    var GRAPH_LEFT = 75;
    var GRAPH_RIGHT = 625;
  
    var GRAPH_HEIGHT = 350;
    var GRAPH_WIDTH = 550;

    var arrayLen = dataArr.length;
  
    var largest = 0;
    for (var i = 0; i < arrayLen; i++) {  
        if (dataArr[i] > largest) {  
            largest = dataArr[i];
        }  
    }  
  
    // Clear previous graph
    context.clearRect(0, 0, 700, 400);

    // Set font for fillText()  
    context.font = "16px Arial";
    context.fillStyle = "white";
       
    // Draw X and Y axis  
    context.beginPath();
    context.strokeStyle = "white";
    context.moveTo(GRAPH_RIGHT, GRAPH_BOTTOM);
    context.lineTo(GRAPH_LEFT, GRAPH_BOTTOM);
    context.lineTo(GRAPH_LEFT, GRAPH_TOP);
    context.stroke();

    // Reference lines and their values
    var refValues = [0, largest / 4, largest / 2, (largest / 4) * 3, largest];
    for (var j = 0; j < refValues.length; j++) {
        var yPos = GRAPH_BOTTOM - (GRAPH_HEIGHT / 4) * j;
        context.beginPath();
        context.moveTo(GRAPH_LEFT, yPos);
        context.lineTo(GRAPH_RIGHT, yPos);
        context.strokeStyle = "black";
        context.stroke();
        context.fillText(refValues[j], GRAPH_LEFT - 20, yPos + 5);
    }

    // Draw grid
    context.strokeStyle = "white";
    context.lineWidth = 0.5;
    // Horizontal grid lines
    for (var j = 0; j <= 8; j++) {
        var yPos = GRAPH_BOTTOM - (GRAPH_HEIGHT / 8) * j;
        context.beginPath();
        context.moveTo(GRAPH_LEFT, yPos);
        context.lineTo(GRAPH_RIGHT, yPos);
        context.stroke();
    }
    // Vertical grid lines
    var stepX = GRAPH_WIDTH / (arrayLen - 1);
    for (var i = 0; i < arrayLen; i++) {
        var xPos = GRAPH_LEFT + stepX * i;
        context.beginPath();
        context.moveTo(xPos, GRAPH_TOP);
        context.lineTo(xPos, GRAPH_BOTTOM);
        context.stroke();
    }

    // Draw points title
    context.fillText("Points", GRAPH_LEFT - 75, GRAPH_HEIGHT / 2);

    context.beginPath();
    context.lineJoin = "round";
    context.strokeStyle = "orange";
    context.lineWidth = 2;
	
    var x = GRAPH_LEFT;
    var y = (GRAPH_HEIGHT - (dataArr[0] / largest * GRAPH_HEIGHT)) + GRAPH_TOP;
    context.moveTo(x, y);
	
    // Draw lines
    for (var i = 0; i < arrayLen; i++) {
		context.fillStyle = "orange";
        x = GRAPH_LEFT + (GRAPH_WIDTH / (arrayLen - 1)) * i;
        y = (GRAPH_HEIGHT - (dataArr[i] / largest * GRAPH_HEIGHT)) + GRAPH_TOP;
        
        context.lineTo(x, y);
		context.fillRect(x - 4, y - 4, 8, 8);
		context.fillStyle = "white";
        context.fillText(i + 1, x + 5, GRAPH_BOTTOM + 25);
    }
    context.stroke();
}
