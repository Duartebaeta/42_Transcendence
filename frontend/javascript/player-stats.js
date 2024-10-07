// Get Player Stats from JSON file
document.addEventListener("DOMContentLoaded", function() {
	const updateButton = document.getElementById("statsBtn");

	updateButton.addEventListener("click", function() {
		var request = {
			method: 'GET',
			url: 'https://localhost:8080/user-stats/user/',
			headers: {
				'Content-Type': 'application/json',
			}
		};
		
		// Fetch JSON data
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
	});
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
  
    var largest = 8;
    // for (var i = 0; i < arrayLen; i++) {  
    //     if (dataArr[i] > largest) {  
    //         largest = dataArr[i];
    //     }  
    // }  
  
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


	// Need to fix dependeing on the max points allowed
    // Reference lines and their values
    var refValues = [0, largest / 4, largest / 2, (largest / 4) * 3, largest];
    for (var j = 0; j < refValues.length; j++) {
        var yPos = GRAPH_BOTTOM - (GRAPH_HEIGHT / 4) * j;
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
    context.fillText("Points", GRAPH_LEFT - 75, 200);

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
        context.fillText("Game " + (i + 1), x - 25, GRAPH_BOTTOM + 25);
    }
    context.stroke();
}
