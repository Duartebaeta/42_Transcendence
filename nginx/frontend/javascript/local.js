// Global Variables
const DIRECTION = {
	IDLE: 0,
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4
};

const BASE_SPEED = 0.01;

const colors = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];

const Ball = {
	new: function () {
		return {
			width: 18,
			height: 18,
			x: (this.canvas.width / 2) - 9,
			y: (this.canvas.height / 2) - 9,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: this.canvas.width * BASE_SPEED
		};
	}
};

const Ai = {
	new: function (side) {
		return {
			width: 18,
			height: 180,
			x: side === 'left' ? 150 : this.canvas.width - 150,
			y: (this.canvas.height / 2) - 35,
			score: 0,
			move: DIRECTION.IDLE,
			speed: this.canvas.height * BASE_SPEED
		};
	}
};

const Game = {
	initialize: function () {
		this.canvas = document.querySelector("canvas");
		this.context = this.canvas.getContext('2d');

		this.canvas.width = 1400;
		this.canvas.height = 1000;

		this.canvas.style.width = (this.canvas.width / 2) + 'px';
		this.canvas.style.height = (this.canvas.height / 2) + 'px';

		this.player = Ai.new.call(this, 'left');
		this.ai = Ai.new.call(this, 'right');
		this.ball = Ball.new.call(this);

		this.running = this.over = false;
		this.turn = this.ai;
		this.timer = this.round = 0;
		this.color = '#8c52ff';

		Pong.menu();
		Pong.listen();
	},

	endGameMenu: function (text) {
		Pong.context.font = '45px Courier New';
		Pong.context.fillStyle = this.color;
		Pong.context.fillRect(Pong.canvas.width / 2 - 350, Pong.canvas.height / 2 - 48, 700, 100);
		Pong.context.fillStyle = '#ffffff';
		Pong.context.fillText(text, Pong.canvas.width / 2, Pong.canvas.height / 2 + 15);
	},

	menu: function () {
		Pong.draw();
		this.context.font = '50px Courier New';
		this.context.fillStyle = this.color;
		this.context.fillRect(this.canvas.width / 2 - 350, this.canvas.height / 2 - 48, 700, 100);
		this.context.fillStyle = '#ffffff';
		this.context.fillText('Press any key to begin', this.canvas.width / 2, this.canvas.height / 2 + 15);
	},

	update: function () {
		if (!this.over) {
			if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
			if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
			if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
			if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

			if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
			else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

			if (this.ai.move === DIRECTION.UP) this.ai.y -= this.ai.speed;
			else if (this.ai.move === DIRECTION.DOWN) this.ai.y += this.ai.speed;

			if (Pong._turnDelayIsOver.call(this) && this.turn) {
				this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
				this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
				this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
				this.turn = null;
			}

			if (this.player.y <= 0) this.player.y = 0;
			else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

			if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
			else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
			if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
			else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

			if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
			else if (this.ai.y <= 0) this.ai.y = 0;

			if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
				if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
					this.ball.x = (this.player.x + this.ball.width);
					this.ball.moveX = DIRECTION.RIGHT;
				}
			}

			if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
				if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
					this.ball.x = (this.ai.x - this.ball.width);
					this.ball.moveX = DIRECTION.LEFT;
				}
			}
		}

		if (this.player.score === 5) {
			this.over = true;
			setTimeout(function () {
				Pong.endGameMenu('Left Wins!');
				endGame();
			}, 1000);
		} else if (this.ai.score === 5) {
			this.over = true;
			setTimeout(function () {
				Pong.endGameMenu('Right Wins!');
				endGame();
			}, 1000);
		}
	},

	draw: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = this.color;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = '#ffffff';
		this.context.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
		this.context.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);

		if (Pong._turnDelayIsOver.call(this)) {
			this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
		}

		this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
		this.context.lineTo((this.canvas.width / 2), 140);
		this.context.lineWidth = 10;
		this.context.strokeStyle = '#ffffff';
		this.context.stroke();

		this.context.font = '100px Courier New';
		this.context.textAlign = 'center';

		this.context.fillText(this.player.score.toString(), (this.canvas.width / 2) - 300, 200);
		this.context.fillText(this.ai.score.toString(), (this.canvas.width / 2) + 300, 200);

		this.context.font = '30px Courier New';
		this.context.fillText('Round ' + (Pong.round + 1), (this.canvas.width / 2), 35);
		this.context.font = '40px Courier';
	},

	loop: function () {
		Pong.update();
		Pong.draw();

		if (!Pong.over) requestAnimationFrame(Pong.loop);
	},



	listen: function () {
		let keyState = {};
	
		document.addEventListener("keydown", function (event) {
			if (Pong.running === false) {
				Pong.running = true;
				window.requestAnimationFrame(Pong.loop);
			}

			// Handle up arrow and w key events
			keyState[event.code] = true;
			Pong.updateMovement(keyState);
		});
	
		document.addEventListener('keyup', function (event) {	
			keyState[event.code] = false;
			Pong.updateMovement(keyState);
		});
	},

	updateMovement: function (keyState) {
		console.log(keyState)
		if (keyState["KeyW"]) {
			Pong.player.move = DIRECTION.UP;
		} if (keyState["ArrowUp"]) {
			Pong.ai.move = DIRECTION.UP
		} if (keyState["KeyS"]) {
			Pong.player.move = DIRECTION.DOWN;
		} if (keyState["ArrowDown"]) {
			Pong.ai.move = DIRECTION.DOWN
		} if (!keyState["KeyW"] && !keyState["KeyS"]) {
			Pong.player.move = DIRECTION.IDLE;
		} if (!keyState["ArrowUp"] && !keyState["ArrowDown"]) {
			Pong.ai.move = DIRECTION.IDLE
		}
	},
	
	_resetTurn: function(victor, loser) {
		this.ball = Ball.new.call(this, this.ball.speed);
		this.turn = loser;
		this.timer = (new Date()).getTime();
		this.color = this._generateRoundColor();
		victor.score++;
	},
	
	_turnDelayIsOver: function() {
		return ((new Date()).getTime() - this.timer >= 1000);
	},
	
	_generateRoundColor: function () {
		var newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === this.color) return Pong._generateRoundColor();
		return newColor;
	}
};

let Pong;

function startLocal() {
	document.querySelector('.game').classList.remove('d-none');
	document.querySelector('#sidebar-cover').classList.remove('d-none');
	document.querySelector('.game').classList.add('d-block');
	document.querySelector('.game-menu').classList.add('d-none');
	Pong = Object.assign({}, Game);
	Pong.initialize();
}

function endGame() {
	document.querySelector('#canvas-home-button').addEventListener('click', function () {
		document.querySelector('.game').classList.add('d-none');
		document.querySelector('#sidebar-cover').classList.add('d-none');
		document.querySelector('#canvas-home-button').classList.add('d-none');
		document.querySelector('.game-menu').classList.remove('d-none');
	});
	document.querySelector('#canvas-home-button').classList.remove('d-none');
}

export { startLocal };