# consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import uuid
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

		if not GameManager.check_game_exists(self.game_id):
			await self.send(text_data=json.dumps({'type': 'game_error', 'error': 'Game not found'}))
			await self.close()
			return

		self.game = await GameManager.get_game(self.game_id)
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

		if len(game.get_players()) == 0:
			del GameManager.games[self.game_id]

		print(f"Player {self.username} disconnected from game {self.game_id}")

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message_type = text_data_json.get('type')

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
		elif message_type == 'position_change':
			player = text_data_json.get('player')
			position = text_data_json.get('position')
			self.game.set_position(player, position)

	async def start_game(self, event):
		print(f"Game {self.game_id} started")
		await self.send(text_data=json.dumps({
			'type': 'start_game',
		}))
		await self.schedule_update()

	async def game_over(self, event):
		winner = event['winner']
		print(f"Game {self.game_id} is over. Winner: {winner}")
		await self.send(text_data=json.dumps({
			'type': 'game_over',
			'winner': winner,
			'game_state': event['game_state']
		}))

	async def direction_change(self, event):
		await self.send(text_data=json.dumps({
			'type': 'direction_change',
			'left': event['left'],
			'right': event['right'],
			'position': event['position']
		}))

	async def schedule_update(self):
		if self.game.game_over:
			return
		loop = asyncio.get_event_loop()
		loop.call_later(0.01, lambda: asyncio.create_task(self.game_update()))

	async def game_update(self, event=None):
		if self.game.game_over:
			return

		game_state = self.game.get_game_state()

		# Update ball position
		ball_x = game_state['ball_x']
		ball_y = game_state['ball_y']
		ball_move_x = game_state['ball_move_x']
		ball_move_y = game_state['ball_move_y']
		left_y = game_state['left_y']
		right_y = game_state['right_y']

		# Ball speed
		ball_speed = 3


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
			self.game.right_score += 1
			ball_x = 700
			ball_y = 500
			ball_move_x = 'RIGHT'
		elif ball_x >= 1400:
			self.game.left_score += 1
			ball_x = 700
			ball_y = 500
			ball_move_x = 'LEFT'
		
		if self.game.left_score == 5:
			self.game.game_over = True
			self.game.set_game_state(ball_x, ball_y, ball_move_x, ball_move_y, left_y, right_y)
			print(f"Triggered game over")
			await self.channel_layer.group_send(
				self.game_group_name,
				{
					'type': 'game_over',
					'winner': 'left',
					'game_state': self.game.get_game_state()
				}
			)
			finalStats = self.game.get_final_stats()
			manager_group_name = 'game_manager_' + self.game_id
			await self.channel_layer.group_send(
				manager_group_name,  # Send to the GameManager group
				{
					'type': 'end_game',
					"game_stats": finalStats,
					"winner": 'left'
				}
			)
		elif self.game.right_score == 5:
			self.game.game_over = True
			self.game.set_game_state(ball_x, ball_y, ball_move_x, ball_move_y, left_y, right_y)
			print(f"Triggered game over")
			await self.channel_layer.group_send(
				self.game_group_name,
				{
					'type': 'game_over',
					'winner': 'right',
					'game_state': self.game.get_game_state()
				}
			)
			finalStats = self.game.get_final_stats()
			manager_group_name = 'game_manager_' + self.game_id
			await self.channel_layer.group_send(
				manager_group_name,  # Send to the GameManager group
				{
					'type': 'end_game',
					"game_stats": finalStats,
					"winner": 'right'
				}
			)


		# Move ball
		if ball_move_x == 'LEFT':
			ball_x -= ball_speed
		else:
			ball_x += ball_speed

		if ball_move_y == 'UP':
			ball_y -= ball_speed
		else:
			ball_y += ball_speed

		# Move the players
		if self.game.left_direction == "UP":
			left_y -= self.game.player_speed
		elif self.game.left_direction == "DOWN":
			left_y += self.game.player_speed
		if self.game.right_direction == "UP":
			right_y -= self.game.player_speed
		elif self.game.right_direction == "DOWN":
			right_y += self.game.player_speed

		#Check for bound limits
		if left_y <= 0:
			left_y = 0
		elif left_y >= 820:
			left_y = 820
		if right_y <= 0:
			right_y = 0
		elif right_y >= 820:
			right_y = 820

		self.game.set_game_state(ball_x, ball_y, ball_move_x, ball_move_y, left_y, right_y)
		#update game state
		await self.update_game_state(self.game.get_game_state())

		# Schedule the next update
		await self.schedule_update()

	async def update_game_state(self, event):
		await self.send(text_data=json.dumps({
			'type': 'update',
			'ball_x': event['ball_x'],
			'ball_y': event['ball_y'],
			'ball_move_x': event['ball_move_x'],
			'ball_move_y': event['ball_move_y'],
			'left_y': event['left_y'],
			'right_y': event['right_y'],
			'left_score': event['left_score'],
			'right_score': event['right_score']
		}))

class TournamentConsumer(AsyncWebsocketConsumer):
	# Store all tournaments in memory
	tournaments = {}

	async def connect(self):
		#Accept all connections
		await self.accept()

	async def disconnect(self, close_code):
		print(f"Disconnected from tournament with {close_code}")

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')

		if message_type == 'create_tournament':
			# Create a new tournament with a unique ID
			tournament_id = self.generate_tournament_id()
			TournamentConsumer.tournaments[tournament_id] = {
				'participants': []
			}
			await self.send(text_data=json.dumps({'type': 'tournament_created', 'displayName': data.get('displayName'), 'tournamentID': tournament_id}))
			print(f"Tournament created with ID: {tournament_id}, {TournamentConsumer.tournaments}")

		elif message_type == 'join_tournament':
			# Handle joining the tournament
			tournament_id = data.get('tournamentID')
			if tournament_id in TournamentConsumer.tournaments:
				display_name = data.get('displayName')
				if display_name in TournamentConsumer.tournaments[tournament_id]['participants']:
					await self.send(text_data=json.dumps({'type': 'duplicate_name', 'error': 'Display name already exists, please try another one'}))
					return
				await self.send(text_data=json.dumps({'type': 'tournament_joined', 'displayName': display_name, 'tournamentID': tournament_id}))
			else:
				await self.send(text_data=json.dumps({'type': 'tournament_error', 'error': 'Tournament not found'}))

	def generate_tournament_id(self):
		# Generate a unique ID for the tournament
		import uuid
		return str(uuid.uuid4())[:8]  # Example: use first 8 characters of a UUID


class GameManager(AsyncWebsocketConsumer):
	games = {}

	async def connect(self):
		# Accept all connections and add to a group
		self.manager_group_name = 'game_manager'

		await self.channel_layer.group_add(
			self.manager_group_name,
			self.channel_name
		)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.manager_group_name,
			self.channel_name
		)
		print(f"Disconnected from GameManager with code {close_code}")

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')

		if message_type == 'create_game':
			game_id = self.create_game()
			await self.send(text_data=json.dumps({'type': 'game_created', 'gameID': game_id}))
		elif message_type == 'join_game':
			game_id = data.get('gameID')
			if game_id in self.games:
				await self.send(text_data=json.dumps({'type': 'game_joined', 'gameID': game_id}))
			else:
				await self.send(text_data=json.dumps({'type': 'game_error', 'error': 'Game not found'}))
		elif message_type == 'change_group':
			new_group = data.get('group_name')
			await self.change_group(new_group)

	def create_game(self):
		# Create a new game with a unique ID
		game_id = str(uuid.uuid4())[:8]
		GameManager.games[game_id] = Game(game_id)  # Store a Game instance
		return game_id

	@classmethod
	async def game_over(cls, game_id):
		if game_id in cls.games:
			game = cls.games[game_id]
			del cls.games[game_id]
			print(f"Removed game {game_id} from GameManager")

	@classmethod
	async def get_game(cls, game_id):
		if game_id not in cls.games:
			cls.games[game_id] = Game(game_id)
		return cls.games[game_id]

	@classmethod
	async def check_game_exists(cls, game_id):
		return game_id in cls.games

	async def create_games(self, event):
		# Receive a message from TournamentConsumer for game creation
		print("Creating games...")
		if event['type'] == 'create_games':
			game_id_1 = self.create_game()
			game_id_2 = self.create_game()
			await self.channel_layer.group_send(
				event['tournament_group'],
				{
					'type': 'tournament_games_created',
					'gameID_1': game_id_1,
					'gameID_2': game_id_2
				}
			)
	async def end_game(self, event):
		game_id = event['game_stats']['game_id']  # Extract game ID before printing or using it
		
		if game_id not in GameManager.games:
			return  # Exit if the game doesn't exist
		
		print(f"Ending game {game_id}")

		await GameManager.game_over(game_id)  # Await game_over method

		# Send message to the game manager group
		await self.channel_layer.group_send(
			self.game_group_name,  # Ensure group name is correct
			{
				'type': 'game_ended',
				'game_id': game_id,
				'gameState': event['game_stats']
			}
		)

	async def game_ended(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_ended',
			'game_id': event['game_id'],
			'gameState': event['gameState']
		}))

	async def change_group(self, new_group):
		print(f"Changing group to {new_group}")
		self.game_group_name = new_group
		
		# Add channel to the group
		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)

		print(f"Successfully added to group {self.game_group_name}")
	
