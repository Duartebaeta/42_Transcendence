from channels.generic.websocket import AsyncWebsocketConsumer
import json
import uuid
import asyncio
from urllib.parse import parse_qs


# game.py
class Game():
	games = {}

	@classmethod
	def check_game_exists(cls, game_id):
		return game_id in cls.games

	@classmethod
	def get_game(cls, game_id):
		if game_id not in cls.games:
			cls.games[game_id] = Game(game_id)
		return cls.games[game_id]

	def __init__(self, game_id):
		self.game_id = game_id
		self.ready_players = set()
		self.players = {}
		self.ball_x = 700
		self.ball_y = 500
		self.ball_move_x = 'LEFT'
		self.ball_move_y = 'DOWN'
		self.left_y = 500
		self.right_y = 500
		self.left_direction = "IDLE"
		self.right_direction = "IDLE"
		self.player_speed = 4
		self.left_score = 0
		self.right_score = 0
		self.game_over = False
		self.closed = False

	def add_player(self, username, channel_name):
		if len(self.players) == 0:
			self.players[username] = {"channel_name": channel_name, "side": "left"}
			return "left"
		elif len(self.players) == 1:
			self.players[username] = {"channel_name": channel_name, "side": "right"}
			return "right"

	def get_player_side(self, username):
		return self.players[username]["side"]

	def remove_player(self, username):
		if username in self.players:
			del self.players[username]
		self.ready_players.discard(username)

	def get_players(self):
		return self.players.keys()

	def player_ready(self, username):
		self.ready_players.add(username)

	def all_players_ready(self):
		return len(self.ready_players) == 2

	def disconnect_game_state(self, loser):
		self.game_over = True
		loser_side = self.players[loser]["side"]
		if (loser_side == "left"):
			winner_side = "right"
		else:
			winner_side = "left"

		if winner_side == "left":
			self.left_score = 5
			return {
				"ball_x": 700,
				"ball_y": 500,
				"ball_move_x": 'LEFT',
				"ball_move_y": 'DOWN',
				"left_y": 500,
				"right_y": 500,
				"left_score": self.left_score,
				"right_score": self.right_score,
				"game_over": True
			}
		else:
			self.right_score = 5
			return {
				"ball_x": 700,
				"ball_y": 500,
				"ball_move_x": 'LEFT',
				"ball_move_y": 'DOWN',
				"left_y": 500,
				"right_y": 500,
				"left_score": self.left_score,
				"right_score": self.right_score,
				"game_over": True
			}

	def get_game_state(self):
		return {
			"ball_x": self.ball_x,
			"ball_y": self.ball_y,
			"ball_move_x": self.ball_move_x,
			"ball_move_y": self.ball_move_y,
			"left_y": self.left_y,
			"right_y": self.right_y,
			"left_score": self.left_score,
			"right_score": self.right_score
		}
  
	def get_final_stats(self):
		return {
			"game_id": self.game_id,
			"player": int(list(self.players.keys())[0]),
			"opponent": int(list(self.players.keys())[1]),
			"player_score": self.left_score,
			"opponent_score": self.right_score,
			"won": self.left_score > self.right_score
		}

	def get_cli_state(self):
		if self.closed == false:
			return {
				"status": "Game hasn't started yet"
			}
		return {
			"player": int(list(self.players.keys())[0]),
			"opponent": int(list(self.players.keys())[1]),
			"player_score": self.left_score,
			"opponent_score": self.right_score,
			"ball_x": self.ball_x,
			"ball_y": self.ball_y,
			"ball_move_x": self.ball_move_x,
			"ball_move_y": self.ball_move_y
		}

	def get_ball_state(self):
		return {
			"ball_x": self.ball_x,
			"ball_y": self.ball_y,
			"ball_move_x": self.ball_move_x,
			"ball_move_y": self.ball_move_y
		}

	def set_game_state(self, ball_x, ball_y, ball_move_x, ball_move_y, left_y, right_y):
		self.ball_x = ball_x
		self.ball_y = ball_y
		self.ball_move_x = ball_move_x
		self.ball_move_y = ball_move_y
		self.left_y = left_y
		self.right_y = right_y

	def set_position(self, player, position):
		if player == "left":
			self.left_y = position
		else:
			self.right_y = position

	def move_player(self, player, direction, position):
		player_y = self.left_y if player == "left" else self.right_y
		if player == "left":
			self.left_direction = direction
		else:
			self.right_direction = direction
		if direction == 'IDLE':
			player_y = position
		if player == "left":
			self.left_y = player_y
		else:
			self.right_y = player_y

	def get_player_directions(self, player):
		return {
			"left": self.left_direction,
			"right": self.right_direction,
			"position": self.left_y if player == "left" else self.right_y
		}
