import random

# Constants for directions
DIRECTION = {
    'IDLE': 0,
    'UP': 1,
    'DOWN': 2,
    'LEFT': 3,
    'RIGHT': 4,
}

class Ball:
    def __init__(self, canvas_width, canvas_height, speed=7):
        self.width = 18
        self.height = 18
        self.x = canvas_width / 2 - 9
        self.y = canvas_height / 2 - 9
        self.move_x = DIRECTION['IDLE']
        self.move_y = DIRECTION['IDLE']
        self.speed = speed

    def move(self):
        if self.move_y == DIRECTION['UP']:
            self.y -= self.speed / 1.5
        elif self.move_y == DIRECTION['DOWN']:
            self.y += self.speed / 1.5
        if self.move_x == DIRECTION['LEFT']:
            self.x -= self.speed
        elif self.move_x == DIRECTION['RIGHT']:
            self.x += self.speed

class Paddle:
    def __init__(self, side, canvas_width, canvas_height):
        self.width = 18
        self.height = 180
        self.x = 150 if side == 'left' else canvas_width - 150
        self.y = canvas_height / 2 - 35
        self.score = 0
        self.move = DIRECTION['IDLE']
        self.speed = 8

class Game:
    def __init__(self, canvas_width=1400, canvas_height=1000):
        self.canvas_width = canvas_width
        self.canvas_height = canvas_height
        self.player = Paddle('left', canvas_width, canvas_height)
        self.ai = Paddle('right', canvas_width, canvas_height)
        self.ball = Ball(canvas_width, canvas_height)
        self.running = False
        self.over = False
        self.turn = self.ai
        self.timer = 0
        self.round = 0

    def update(self):
        if not self.over:
            self.ball.move()
            # Handle collisions, scoring, etc.
            # Simplified logic for the example
            if self.ball.x <= 0 or self.ball.x >= self.canvas_width - self.ball.width:
                self.reset_turn(self.player if self.ball.x >= self.canvas_width - self.ball.width else self.ai)

    def reset_turn(self, victor):
        self.ball = Ball(self.canvas_width, self.canvas_height)
        self.turn = self.ai if victor == self.player else self.player
        self.timer = 0
        victor.score += 1

    def to_dict(self):
        return {
            'player': {'x': self.player.x, 'y': self.player.y, 'score': self.player.score},
            'ai': {'x': self.ai.x, 'y': self.ai.y, 'score': self.ai.score},
            'ball': {'x': self.ball.x, 'y': self.ball.y}
        }
