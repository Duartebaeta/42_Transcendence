// BACKEND CONECTION CODE
let gameId = "";
let username;
let socket;
let isSocketConnected = false;
var Pong;

function startGame(event) {
	event.preventDefault();
	username = event.target.elements.username.value;
	gameId = event.target.elements.gameID.value;
	const game_container = document.querySelector('.game');
	const game_menu = document.querySelector('.game-menu');

	socket = new WebSocket(`ws://192.168.68.57:8000/ws/game/${gameId}/${username}/`);
	socket.onopen = function(e) {
		console.log("[open] Connection established");
		isSocketConnected = true; // Mark the socket as connected
		game_container.classList.remove('hidden');
		game_menu.classList.add('hidden');

		// Initialize and start the game here
		Pong = Object.assign({}, Game);
	};
	
	socket.onmessage = function(event) {
		const gameState = JSON.parse(event.data);
		if (gameState.type === "game_start") {
			SockIn.gameStart(Pong);
		} else if (gameState.type === "game_end") {
			SockIn.gameEnd(Pong, gameState.message);
		} else if (gameState.type === "start_game") {
			console.log("Both players are ready. Starting the game...");
			SockIn.gameStart(Pong);
		} else if (gameState.type === "countdown") {
			console.log("Countdown message captured")
			Pong.countdown(gameState.count);
		} else if (gameState.type === "update") {
			Pong.backendUpdate(gameState);
		} else if (gameState.type === "assign_side") {
			Pong.side = gameState.side;
			Pong.initialize();
			console.log("Assigned side:", Pong.side);
		} else if (gameState.type === "direction_change") {
			console.log("Direction change message captured")
			SockIn.direction_change(gameState);
		}
	};
	
	socket.onclose = function(event) {
		if (event.wasClean) {
			console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			console.log('[close] Connection died');
		}
		document.getElementById("status").textContent = "Disconnected";
		isSocketConnected = false; // Mark the socket as disconnected
	};
	
	socket.onerror = function(error) {
		console.log(`[error] ${error.message}`);
	};
}

// Global Variables
var DIRECTION = {
	IDLE: "IDLE",
	UP: "UP",
	DOWN: "DOWN",
	LEFT: "LEFT",
	RIGHT: "RIGHT",
};

var colors = ["#00ff9f", "#bd00ff", "#00b8ff", "#001eff", "#d600ff"];
let color_increment = 0;

// The ball object (The cube that bounces back and forth)
var Ball = {
	new: function (incrementedSpeed) {
		return {
			width: 18,
			height: 18,
			x: this.canvas.width / 2 - 9,
			y: this.canvas.height / 2 - 9,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: incrementedSpeed || 7,
		};
	},
};

// The object (The two lines that move up and down)
var Paddle = {
	new: function (side) {
		return {
			width: 18,
			height: 180,
			x: side === "left" ? 150 : this.canvas.width - 150,
			y: this.canvas.height / 2 - 35,
			score: 0,
			move: DIRECTION.IDLE,
			speed: 8,
		};
	},
};

const SockIn = {
	initialize: function (game) {
		console.log("Initializing socket events...");
	},
	gameStart: function (game) {
		console.log("Game started...");
		game.running = true;
		window.requestAnimationFrame(Pong.loop.bind(Pong));
	},
	gameEnd: function (game, text) {
		console.log("Game ended...");
		game.over = true;
		setTimeout(function () {
			Pong.endGameMenu(text);
		}, 1000);
	},
	countdown: function(game, number) {
		Pong.countdown(number);
	},
	direction_change: function(gameState) {
		idle_check = Pong.ai.move == DIRECTION.IDLE;
		console.log("ai move: ", Pong.ai.move, "idle check: ", idle_check);
		console.log("Player side: ", Pong.side);
		if (Pong.side == "left") {
			Pong.player.move = gameState.left;
			Pong.ai.move = gameState.right;
		}
		else {
			Pong.player.move = gameState.right;
			Pong.ai.move = gameState.left;
		}
		// if (idle_check) {
		// 	return;
		// } else if (Pong.ai.move == DIRECTION.IDLE) {
		// 	Pong.ai.y = gameState.position;
		// 	window.requestAnimationFrame(Pong.loop.bind(Pong));
		// }
	}
};

const SockOut = {
	gameStart: function () {
		console.log("Starting game...");
		if (isSocketConnected) {
			socket.send(JSON.stringify({
				type: 'ready',
				player: username  // Change to player username in future
			}));
		} else {
			console.log("WebSocket is not connected.");
		}
	},
	sendPosition: function (direction, player) {
		if (isSocketConnected) {
			socket.send(JSON.stringify({
				type: "move",
				player: player,
				direction: direction
			}));
		} else {
			console.log("WebSocket is not connected.");
		}
	},
	toggleMove: function (direction, position) {
		if (isSocketConnected) {
			socket.send(JSON.stringify({
				type: "move",
				direction: direction,
				position: position
			}));
		} else {
			console.log("WebSocket is not connected.");
		}
	}
};

var Game = {
	initialize: function () {
		this.canvas = document.querySelector("canvas");
		this.context = this.canvas.getContext("2d");

		this.canvas.width = 1400;
		this.canvas.height = 1000;

		this.canvas.style.width = this.canvas.width / 2 + "px";
		this.canvas.style.height = this.canvas.height / 2 + "px";

		let opponent = (this.side === "left" ? "right" : "left");

		this.player = Paddle.new.call(this, this.side);
		this.ai = Paddle.new.call(this, opponent);
		this.ball = Ball.new.call(this);

		this.ai.speed = 5;
		this.running = this.over = false;
		this.turn = this.ai;
		this.timer = this.round = 0;
		this.color = colors[color_increment++];

		Pong.menu();
		Pong.listen();
	
		SockIn.initialize(this);
		SockOut.gameStart();
	},

	endGameMenu: function (text) {
		// Change the canvas font size and color
		Pong.context.font = "45px Courier New";
		Pong.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		Pong.context.fillRect(
			Pong.canvas.width / 2 - 350,
			Pong.canvas.height / 2 - 48,
			700,
			100
		);

		// Change the canvas color;
		Pong.context.fillStyle = "#ffffff";

		// Draw the end game menu text ('Game Over' and 'Winner')
		Pong.context.fillText(
			text,
			Pong.canvas.width / 2,
			Pong.canvas.height / 2 + 15
		);
	},

	menu: function () {
		// Draw all the Pong objects in their current state
		Pong.draw();

		// Change the canvas font size and color
		this.context.font = "40px Courier New";
		this.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		this.context.fillRect(
			this.canvas.width / 2 - 350,
			this.canvas.height / 2 - 48,
			700,
			100
		);

		// Change the canvas color;
		this.context.fillStyle = "#ffffff";

		// Draw the 'press any key to begin' text
		this.context.fillText(
			"Waiting for both players to ready up",
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
		);
	},

	// Frontend countdown function
	countdown: function (number) {
		// Draw all the Pong objects in their current state
		Pong.draw();

		// Change the canvas font size and color
		this.context.font = "50px Courier New";
		this.context.fillStyle = this.color;

		// Draw the rectangle behind the countdown text
		this.context.fillRect(
			this.canvas.width / 2 - 350,
			this.canvas.height / 2 - 48,
			700,
			100
		);

		// Change the canvas color;
		this.context.fillStyle = "#ffffff";

		// Draw the countdown number
		this.context.fillText(
			number.toString(),
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
		);
	},

	// Update all objects (move the player, ai, ball, increment the score, etc.)
	update: function () {
		if (!this.over) {
			// Move player if they player.move value was updated by a keyboard event
			if (this.player.move === DIRECTION.UP) {
				this.player.y -= this.player.speed;
				// SockOut.sendPosition("UP", this.side);
			} else if (this.player.move === DIRECTION.DOWN) {
				this.player.y += this.player.speed;
				// SockOut.sendPosition("DOWN", this.side);
			}
			if (this.ai.move === DIRECTION.UP) {
				this.ai.y -= this.player.speed;
				// SockOut.sendPosition("UP", this.side);
			} else if (this.ai.move === DIRECTION.DOWN) {
				this.ai.y += this.player.speed;
				// SockOut.sendPosition("DOWN", this.side);
			}

			// If the player collides with the bound limits, update the x and y coords.
		}
	},

	backendUpdate: function(gameState) {
		Pong.ball.x = gameState.ball_x;
		Pong.ball.y = gameState.ball_y;
		// if (this.side === "left") {
		// 	this.player.y = gameState.left_y;
		// 	this.ai.y = gameState.right_y;
		// } else {
		// 	this.player.y = gameState.right_y;
		// 	this.ai.y = gameState.left_y;
		// }

		Pong.draw();
	},

	// Draw the objects to the canvas element
	draw: function () {
		// Clear the Canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Set the fill style to black
		this.context.fillStyle = this.color;

		// Draw the background
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Set the fill style to white (For the paddles and the ball)
		this.context.fillStyle = "#ffffff";

		// Draw the Player
		this.context.fillRect(
			this.player.x,
			this.player.y,
			this.player.width,
			this.player.height
		);

		// Draw the Ai
		this.context.fillRect(
			this.ai.x,
			this.ai.y,
			this.ai.width,
			this.ai.height
		);

		// Draw the Ball
		if (Pong._turnDelayIsOver.call(this)) {
			this.context.fillRect(
				this.ball.x,
				this.ball.y,
				this.ball.width,
				this.ball.height
			);
		}

		// Draw the net (Line in the middle)
		this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo(this.canvas.width / 2, this.canvas.height - 140);
		this.context.lineTo(this.canvas.width / 2, 140);
		this.context.lineWidth = 10;
		this.context.strokeStyle = "#ffffff";
		this.context.stroke();

		// Set the default canvas font and align it to the center
		this.context.font = "100px Courier New";
		this.context.textAlign = "center";

		// Draw the players score (left)
		this.context.fillText(
			this.player.score.toString(),
			this.canvas.width / 2 - 300,
			200
		);

		// Draw the paddles score (right)
		this.context.fillText(
			this.ai.score.toString(),
			this.canvas.width / 2 + 300,
			200
		);

		// Change the font size for the center score text
		this.context.font = "30px Courier New";

		// Draw the winning score (center)
		this.context.fillText(
			"Round " + (Pong.round + 1),
			this.canvas.width / 2,
			35
		);

		// Change the font size for the center score value
		this.context.font = "40px Courier";
	},

	loop: function () {
		Pong.update();
		Pong.draw();

		// If the game is not over, draw the next frame.
		if (!Pong.over) requestAnimationFrame(Pong.loop);
	},

	listen: function () {
		document.addEventListener("keydown", function (key) {
			// Handle up arrow and w key events
			if (key.keyCode === 38 || key.keyCode === 87) {
				Pong.player.move = DIRECTION.UP;
				SockOut.toggleMove(DIRECTION.UP, Pong.player.y);
			}

			// Handle down arrow and s key events
			if (key.keyCode === 40 || key.keyCode === 83) {
				Pong.player.move = DIRECTION.DOWN;
				SockOut.toggleMove(DIRECTION.DOWN, Pong.player.y);
			}
		});

		// Stop the player from moving when there are no keys being pressed.
		document.addEventListener("keyup", function (key) {
			Pong.player.move = DIRECTION.IDLE;
			SockOut.toggleMove(DIRECTION.IDLE, Pong.player.y);
		});
	},

	// // Reset the ball location, the player turns and set a delay before the next round begins.
	// _resetTurn: function (victor, loser) {
	//     this.ball = Ball.new.call(this, this.ball.speed);
	//     this.turn = loser;
	//     this.timer = new Date().getTime();
	//     this.color = colors[color_increment++];

	//     if (color_increment >= colors.length) color_increment = 0;
	// },

	// Wait for a delay to have passed after each turn.
	_turnDelayIsOver: function () {
		return new Date().getTime() - this.timer >= 1000;
	},

	// Select a random color as the background of each level/round.
	_generateRoundColor: function () {
		var newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === this.color) return Pong._generateRoundColor();
		return newColor;
	},
};




// // Handle ai (AI) UP and DOWN movement
// if (this.ai.y > this.ball.y - this.ai.height / 2) {
// 	if (this.ball.moveX === DIRECTION.RIGHT)
// 		this.ai.y -= this.ai.speed / 1.5;
// 	else this.ai.y -= this.ai.speed / 4;
// }
// if (this.ai.y < this.ball.y - this.ai.height / 2) {
// 	if (this.ball.moveX === DIRECTION.RIGHT)
// 		this.ai.y += this.ai.speed / 1.5;
// 	else this.ai.y += this.ai.speed / 4;
// }

// // Handle ai (AI) wall collision
// if (this.ai.y >= this.canvas.height - this.ai.height)
// 	this.ai.y = this.canvas.height - this.ai.height;
// else if (this.ai.y <= 0) this.ai.y = 0;
// // Handle ai-ball collision
// if (
// 	this.ball.x - this.ball.width <= this.ai.x &&
// 	this.ball.x >= this.ai.x - this.ai.width
// ) {
// 	if (
// 		this.ball.y <= this.ai.y + this.ai.height &&
// 		this.ball.y + this.ball.height >= this.ai.y
// 	) {
// 		this.ball.x = this.ai.x - this.ball.width;
// 		this.ball.moveX = DIRECTION.LEFT;
// 	}
// }