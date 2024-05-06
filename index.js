// Login Modal Trigger
// document.addEventListener('DOMContentLoaded', function() {
// 	var myModal = new bootstrap.Modal(document.getElementById('login-modal'));
// 	myModal.show();
// });

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

                // Update HTML content
                document.getElementById('gamesPlayed').innerText = gamesPlayed;
                document.getElementById('wins').innerText = wins;
                document.getElementById('losses').innerText = losses;
                document.getElementById('tournamentWins').innerText = tournamentWins;
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


// Stats Dashboard
document.addEventListener("DOMContentLoaded", function() {
	const canvas = document.getElementById("chartCanvas");
    const ctx = canvas.getContext('2d');
    const dataY = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const dataX = [100, 150, 160, 250, 260, 300, 360];

    function drawLineGraph() {
      const margin = 50;
      const chartWidth = canvas.width - 2 * margin;
      const chartHeight = canvas.height - 2 * margin;

      // Draw axes
      ctx.beginPath();
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, canvas.height - margin);
      ctx.lineTo(canvas.width - margin, canvas.height - margin);
      ctx.stroke();

      // Draw data points and lines
      ctx.beginPath();
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.moveTo(margin, canvas.height - margin - (dataX[0] - Math.min(...dataX)) * chartHeight / (Math.max(...dataX) - Math.min(...dataX)));
      for (let i = 1; i < dataX.length; i++) {
        const x = margin + i * (chartWidth / (dataX.length - 1));
        const y = canvas.height - margin - (dataX[i] - Math.min(...dataX)) * chartHeight / (Math.max(...dataX) - Math.min(...dataX));
        ctx.lineTo(x, y);
        ctx.stroke();

        // Draw data points as circles
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
      }

      // Draw X-axis labels
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      for (let i = 0; i < dataY.length; i++) {
        const x = margin + i * (chartWidth / (dataY.length - 1));
        const y = canvas.height - margin + 20;
        ctx.fillText(dataY[i], x, y);
      }

      // Draw Y-axis labels
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i < dataX.length; i++) {
        const x = margin - 10;
        const y = canvas.height - margin - i * (chartHeight / (dataX.length - 1));
        ctx.fillText(dataX[i], x, y);
      }
    }

    canvas.addEventListener('mousemove', function (event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Show tooltip
      const tooltip = document.getElementById("tooltip");
      tooltip.style.display = "block";
      tooltip.style.left = (event.clientX + 10) + "px";
      tooltip.style.top = (event.clientY + 10) + "px";

      // Find closest data point
      let closestIndex = 0;
      let minDistance = Infinity;
      for (let i = 0; i < dataX.length; i++) {
        const distance = Math.abs(x - (margin + i * (chartWidth / (dataX.length - 1))));
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      tooltip.innerHTML = `${dataY[closestIndex]}: ${dataX[closestIndex]}`;
    });

    canvas.addEventListener('mouseleave', function () {
      // Hide tooltip
      const tooltip = document.getElementById("tooltip");
      tooltip.style.display = "none";
    });

    drawLineGraph();
});
