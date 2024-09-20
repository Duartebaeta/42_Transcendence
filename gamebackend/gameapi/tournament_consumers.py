# tournament_consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from .consumers import TournamentConsumer
import json
import random
from .consumers import GameManager
import uuid
from .game import Game

# Tournament Consumer Class
class SpecificTournamentConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
		self.display_name = self.scope['url_route']['kwargs']['display_name']
		self.group_name = f'tournament_{self.tournament_id}'
		self.current_round = 1

		# Add to the tournament group
		await self.channel_layer.group_add(
			self.group_name,
			self.channel_name
		)

		await self.accept()

		# Add the participant to the tournament
		if self.tournament_id not in TournamentConsumer.tournaments:
			TournamentConsumer.tournaments[self.tournament_id] = {'participants': []}
		TournamentConsumer.tournaments[self.tournament_id]['participants'].append(self.display_name)

		self.my_tournament = TournamentConsumer.tournaments[self.tournament_id]

		if len(self.my_tournament['participants']) == 4:
			print(f"Starting tournament {self.tournament_id}")
			await self.round_1()

	async def disconnect(self, close_code):
		if self.tournament_id in TournamentConsumer.tournaments:
			participants = self.my_tournament['participants']
			if self.display_name in participants:
				participants.remove(self.display_name)

			if not participants:
				del TournamentConsumer.tournaments[self.tournament_id]

		await self.channel_layer.group_discard(
			self.group_name,
			self.channel_name
		)
		print(f"{self.display_name} disconnected from tournament {self.tournament_id}")

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data['type'] == 'tournament_message':
			await self.channel_layer.group_send(
				self.group_name,
				{
					'type': 'tournament_message',
					'message': data
				}
			)
		elif data['type'] == 'get_participants':
			participants = self.my_tournament['participants']
			await self.send(text_data=json.dumps({
				'type': 'get_participants',
				'participants': participants
			}))

		elif data['type'] == 'game_over':
			data = data['data']
			if self.display_name == data['winner']:
				curr_round = self.my_tournament['rounds'][f'round_{self.current_round}']
				curr_round['winners'].append(data['winner'])
				if len(curr_round['winners']) == 2:
					self.current_round += 1
					if self.current_round == 2:
						await self.round_2(curr_round['winners'])
					else:
						pass


	async def round_1(self):
		# Shuffle participants before creating matchings
		participants = self.my_tournament['participants']
		random.shuffle(participants)

		game_id_1 = str(uuid.uuid4())[:8]
		game_id_2 = str(uuid.uuid4())[:8]
		GameManager.games[game_id_1] = Game(game_id_1)  # Store a Game instance
		GameManager.games[game_id_2] = Game(game_id_2)  # Store a Game instance

		# Assign the shuffled participants to matchings
		self.my_tournament['rounds'] = {
			'round_1': {
				'matching_1': [participants[0], participants[1]],
				'matching_2': [participants[2], participants[3]],
				'gameID_1': game_id_1,
				'gameID_2': game_id_2,
				'participants': participants,
				'winners': []
			}
		}
		await self.channel_layer.group_send(
			self.group_name,
			{
				'type': 'tournament_message',
				'message': {
					'type': 'tournament_full',
					'matching_1': [participants[0], participants[1]],
					'matching_2': [participants[2], participants[3]],
					'participants': participants,
					'gameID_1': game_id_1,
					'gameID_2': game_id_2
				}
			}
		)

	async def round_2(self, winners):
		gameID = str(uuid.uuid4())[:8]
		GameManager.games[gameID] = Game(gameID)

		print(f"Round 2: {winners}")
	
		self.my_tournament['rounds']['round_2'] = {
			'matching': [winners[0], winners[1]],
			'gameID': gameID,
			'winner': []
		}
		await self.channel_layer.group_send(
			self.group_name,
			{
				'type': 'tournament_message',
				'message': {
					'type': 'tournament_final',
					'matching': [winners[0], winners[1]],
					'gameID': gameID
				}
			}
		)

	async def tournament_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))

	async def tournament_final(self, event):

		self.my_tournament['rounds']['round_2'][gameID] = event['gameID']

		await self.send(text_data=json.dumps({
			'type': 'tournament_final',
			'matching': self.my_tournament['rounds']['round_2']['matching'],
			'gameID': event['gameID'],
	}))