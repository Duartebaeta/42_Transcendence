// BACKEND CONECTION CODE
// Global Variables
import { BACKEND_IP, PORT } from "./game-logic.js";

let gameId = "";
let username;
let socket;
let isSocketConnected = false;
var Pong;
let serving = false;

var colors = ["#00ff9f", "#bd00ff", "#00b8ff", "#001eff", "#d600ff"];
let color_increment = 0;

const BASE_SPEED = 0.01;

var DIRECTION = {
	IDLE: "IDLE",
	UP: "UP",
	DOWN: "DOWN",
	LEFT: "LEFT",
	RIGHT: "RIGHT",
};

function startGame(GAME_ID, _username = "") {
	const generateRandomString = length => 
		Array.from({ length }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
	username = _username
	if (username == "")
		username = generateRandomString(10); // Generate a random username for the player, temporary solution to avoid duplicate names while not connected to db yet

	gameId = GAME_ID;
	const game_container = document.querySelector('.game');
	const game_menu = document.querySelector('.game-menu');

	socket = new WebSocket(`ws://${BACKEND_IP}:${PORT}/ws/game/${gameId}/${username}/`);
	socket.onopen = function(e) {
		console.log("[open] Connection established");
		isSocketConnected = true;
		game_container.classList.remove('d-none');
		game_menu.classList.add('d-none');

		// Initialize and start the game here
		Pong = Object.assign({}, Game);
	};
	
	socket.onmessage = function(event) {
		const gameState = JSON.parse(event.data);
		if (gameState.type === "start_game") {
			SockIn.gameStart(Pong);
		} else if (gameState.type === "update") {
			Pong.backendUpdate(gameState);
		} else if (gameState.type === "assign_side") {
			Pong.side = gameState.side;
			Pong.initialize();
		} else if (gameState.type === "direction_change") {
			SockIn.direction_change(gameState);
		} else if (gameState.type === "game_over") {
			Pong.backendUpdate(gameState.game_state);
			SockIn.gameEnd(Pong, gameState.winner);
		} else if (gameState.type === "serve_ball") {
			Pong.serveBall("Game is starting...");
			setTimeout(function() {
				serving = true;
				let text;
				if (Pong.side == "left") {
					text = "Press any key to serve";
				} else {
					text = "Waiting for opponent to serve";
				}
				Pong.serveBall(text);
			}, 3000);  // 5000 milliseconds = 5 seconds
		}
	};
	
	socket.onclose = function(event) {
		if (event.wasClean) {
			console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			console.log('[close] Connection died');
		}
		isSocketConnected = false; // Mark the socket as disconnected
	};
	
	socket.onerror = function(error) {
		console.log(`[error] ${error.message}`);
	};
}

// The ball object (The cube that bounces back and forth)
var Ball = {
	new: function () {
		return {
			width: 18,
			height: 18,
			x: this.canvas.width / 2 - 9,
			y: this.canvas.height / 2 - 9,
			moveX: DIRECTION.LEFT,
			moveY: DIRECTION.DOWN,
			speed: this.canvas.width * BASE_SPEED,
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
			speed: this.canvas.height * BASE_SPEED,
		};
	},
};

const SockIn = {
	gameStart: function (game) {
		game.running = true;
		window.requestAnimationFrame(Pong.loop.bind(Pong));
	},
	gameEnd: function (game, winner_side) {
		game.over = true;
		let text;
		if (game.side == winner_side) {
			text = "You win!";
		} else {
			text = "You lose!";
		}
		Pong.endGameMenu(text);
	},
	direction_change: function(gameState) {
		let idle_check = Pong.ai.move == DIRECTION.IDLE;
		if (Pong.side == "left") {
			Pong.player.move = gameState.left;
			Pong.ai.move = gameState.right;
		}
		else {
			Pong.player.move = gameState.right;
			Pong.ai.move = gameState.left;
		}
		if (!idle_check) {
			Pong.ai.y = gameState.position;
		}

	}
};

const SockOut = {
	gameStart: function () {
		if (isSocketConnected) {
			socket.send(JSON.stringify({
				type: 'serve_ball'
			}));
		} else {
			console.log("WebSocket is not connected.");
		}
	},
	readyUp: function () {
		if (isSocketConnected) {
			socket.send(JSON.stringify({
				type: "ready",
				player: username
			}));
		} else {
			console.log("WebSocket is not connected.");
		}
	},
	sendPosition: function (direction, player) {
		if (isSocketConnected) {
			socket.send(JSON.stringify({
				type: "position_change",
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
				player: Pong.side,
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

		this.running = this.over = false;
		this.turn = this.ai;
		this.timer = this.round = 0;
		this.color = colors[color_increment++];

		Pong.menu();
		Pong.listen();
		
		// if socket is open send ready message
		SockOut.readyUp();
	},

	serveBall: function (text) {
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
			text,
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
		);
	},

	endGameMenu: function (text) {
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
			text,
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
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

	// Update all objects (move the player, ai, ball, increment the score, etc.)
	update: function () {
		if (!this.over) {
			// Move player if they player.move value was updated by a keyboard event
			if (this.player.move === DIRECTION.UP) {
				this.player.y -= this.player.speed;
			} else if (this.player.move === DIRECTION.DOWN) {
				this.player.y += this.player.speed;
			}
			if (this.ai.move === DIRECTION.UP) {
				this.ai.y -= this.player.speed;
			} else if (this.ai.move === DIRECTION.DOWN) {
				this.ai.y += this.player.speed;
			}

			// If the player collides with the bound limits, update the x and y coords.
			if (this.player.y <= 0) this.player.y = 0;
			else if (this.player.y >= this.canvas.height - this.player.height)
				this.player.y = this.canvas.height - this.player.height;
			// Same for the AI
			if (this.ai.y <= 0) this.ai.y = 0;
			else if (this.ai.y >= this.canvas.height - this.ai.height) 
				this.ai.y = this.canvas.height - this.ai.height;
		}
	},
	backendUpdate: function(gameState) {
		Pong.ball.x = gameState.ball_x;
		Pong.ball.y = gameState.ball_y;
		Pong.ball.moveX = gameState.ball_move_x;
		Pong.ball.moveY = gameState.ball_move_y;
		if (this.side == "left") {
			Pong.player.y = gameState.left_y;
			Pong.ai.y = gameState.right_y;
			Pong.player.score = gameState.left_score;
			Pong.ai.score = gameState.right_score;
		} else {
			Pong.player.y = gameState.right_y;
			Pong.ai.y = gameState.left_y;
			Pong.player.score = gameState.right_score;
			Pong.ai.score = gameState.left_score;
		}
		
		if (!Pong.over) {
			Pong.draw();
		}
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
	
		this.context.fillStyle = "#ffffff";
	
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
	
		let leftScore;
		let rightScore;
	
		if (this.side == "left") {
			leftScore = this.player.score;
			rightScore = this.ai.score;
		} else {
			leftScore = this.ai.score;
			rightScore = this.player.score;
		}
	
		// Draw the players score (left)
		this.context.fillText(
			leftScore.toString(),
			this.canvas.width / 2 - 300,
			200
		);
	
		// Draw the paddles score (right)
		this.context.fillText(
			rightScore.toString(),
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
		if (!Pong.over && serving == false) {
			Pong.update();
			Pong.draw();
		}
	
		// If the game is not over, draw the next frame.
		if (!Pong.over) requestAnimationFrame(Pong.loop);
	},
	
	listen: function () {
		document.addEventListener("keydown", function (key) {
			// Handle up arrow and w key events
			if (key.keyCode === 38 || key.keyCode === 87) {
				if (Pong.player.move !== DIRECTION.UP) { // Prevent multiple triggers
					Pong.player.move = DIRECTION.UP;
					SockOut.toggleMove(DIRECTION.UP, Pong.player.y);
				}
			}
		
			// Handle down arrow and s key events
			if (key.keyCode === 40 || key.keyCode === 83) {
				if (Pong.player.move !== DIRECTION.DOWN) { // Prevent multiple triggers
					Pong.player.move = DIRECTION.DOWN;
					SockOut.toggleMove(DIRECTION.DOWN, Pong.player.y);
				}
			}

			if (serving == true && Pong.running == false && Pong.side == "left") {
				SockOut.gameStart();
				serving = false;
			}

		});
	
		// Stop the player from moving when there are no keys being pressed.
		document.addEventListener("keyup", function (key) {
			Pong.player.move = DIRECTION.IDLE;
			SockOut.toggleMove(DIRECTION.IDLE, Pong.player.y);
		});
	},
	
	// Wait for a delay to have passed after each turn.
	_turnDelayIsOver: function () {
		return new Date().getTime() - this.timer >= 1000;
	},
	
	// Select a random color as the background of each level/round.
	_generateRoundColor: function () {
		var newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === this.color) return Pong._generateRoundColor();
		return newColor;
	}
};
export { startGame };