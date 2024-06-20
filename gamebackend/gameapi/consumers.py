# consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
from urllib.parse import parse_qs
from .game import Game

class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		query_string = self.scope['query_string'].decode()
		query_params = parse_qs(query_string)
		self.username = self.scope['url_route']['kwargs']['username']

		if not self.username:
			await self.close()
			return

		self.game = Game.get_game(self.game_id)  # Correctly assign the game here
		self.side = self.game.add_player(self.username, self.channel_name)
		self.game_group_name = f'game_{self.game_id}'

		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)

		await self.accept()
		print(f"Player {self.username} connected to game {self.game_id}")

		# Send the player their assigned side
		await self.send(text_data=json.dumps({
			'type': 'assign_side',
			'side': self.side
		}))

	async def disconnect(self, close_code):
		if hasattr(self, 'game'):
			self.game.remove_player(self.username)

		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)
		print(f"Player {self.username} disconnected from game {self.game_id}")

	async def receive(self, text_data):
		print(f"Message received in game {self.game_id}: {text_data}")
		text_data_json = json.loads(text_data)
		message_type = text_data_json.get('type')

		print(f"Message type: {message_type}")

		if message_type == 'ready':
			player = text_data_json.get('player')
			self.game.player_ready(player)
			print(f"Player {player} is ready in game {self.game_id}")
			print(f"Players ready: {len(self.game.ready_players)}")

			if self.game.all_players_ready():
				print(f"Both players are ready in game {self.game_id}. Starting the game...")
				await self.channel_layer.group_send(
					self.game_group_name,
					{
						'type': 'start_game',
					}
				)

		elif message_type == 'move':
			print(f"Player {self.username} moved")
			player = text_data_json.get('player')
			direction = text_data_json.get('direction')
			position = text_data_json.get('position')
			self.game.move_player(player, direction, position)

			# Broadcast the move to all players
			player_directions = self.game.get_player_directions(player)

			await self.channel_layer.group_send(
				self.game_group_name,
				{
					'type': 'direction_change',
					'left': player_directions['left'],
					'right': player_directions['right'],
					'position': player_directions['position']
				}
			)

	async def start_countdown(self, event):
		for i in range(5, 0, -1):
			await self.channel_layer.group_send(
				self.game_group_name,
				{
					'type': 'countdown',
					'count': i
				}
			)
			await asyncio.sleep(1)

		await self.channel_layer.group_send(
			self.game_group_name,
			{
				'type': 'start_game'
			}
		)

	async def countdown(self, event):
		count = event['count']
		await self.send(text_data=json.dumps({
			'type': 'countdown',
			'count': count
		}))

	async def start_game(self, event):
		print(f"Game {self.game_id} started")
		await self.send(text_data=json.dumps({
			'type': 'start_game',
		}))
		self.schedule_update()
		self.send_update()

	async def direction_change(self, event):
		await self.send(text_data=json.dumps({
			'type': 'direction_change',
			'left': event['left'],
			'right': event['right'],
			'position': event['position']
		}))

	def send_update(self):
		ballState = self.game.get_ball_state()
		loop = asyncio.get_event_loop()
		loop.call_later(0.5, lambda: asyncio.create_task(self.update_game_state(ballState)))

	def schedule_update(self):
		loop = asyncio.get_event_loop()
		loop.call_later(0.05, lambda: asyncio.create_task(self.game_update()))

	async def game_update(self, event=None):
		game_state = self.game.get_game_state()

		# Update ball position
		ball_x = game_state['ball_x']
		ball_y = game_state['ball_y']
		ball_move_x = game_state['ball_move_x']
		ball_move_y = game_state['ball_move_y']
		left_y = game_state['left_y']
		right_y = game_state['right_y']

		# Ball speed
		ball_speed = 6


		# Collision with top wall
		if ball_y <= 0:
			ball_move_y = 'DOWN'
		# Collision with bottom wall
		elif ball_y >= 980:  # Assuming the canvas height is 1000
			ball_move_y = 'UP'

		# Collision with left paddle
		if 150 <= ball_x <= 159 and left_y <= ball_y <= left_y + 180:
			ball_move_x = 'RIGHT'
		# Collision with right paddle
		elif 1250 <= ball_x <= 1259 and right_y <= ball_y <= right_y + 180:
			ball_move_x = 'LEFT'

		# Ball out of bounds
		if ball_x <= 0:
			self.game.player2_score += 1
			ball_x = 700
			ball_y = 500
			ball_move_x = 'RIGHT'
		elif ball_x >= 1400:
			self.game.player1_score += 1
			ball_x = 700
			ball_y = 500
			ball_move_x = 'LEFT'

		# Move ball
		if ball_move_x == 'LEFT':
			ball_x -= ball_speed
		else:
			ball_x += ball_speed

		if ball_move_y == 'UP':
			ball_y -= ball_speed
		else:
			ball_y += ball_speed

		self.game.set_game_state(ball_x, ball_y, ball_move_x, ball_move_y, left_y, right_y)

		# Schedule the next update
		self.schedule_update()

	async def update_game_state(self, event):
		await self.send(text_data=json.dumps({
			'type': 'update',
			'ball_x': event['ball_x'],
			'ball_y': event['ball_y'],
			'ball_move_x': event['ball_move_x'],
			'ball_move_y': event['ball_move_y']
		}))
		self.send_update()