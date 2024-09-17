# tournament_consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from .consumers import TournamentConsumer
import json
from .consumers import GameManager

# Tournament Consumer Class
class SpecificTournamentConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
		self.display_name = self.scope['url_route']['kwargs']['display_name']
		self.group_name = f'tournament_{self.tournament_id}'

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

		if len(TournamentConsumer.tournaments[self.tournament_id]['participants']) == 4:
			await self.matchmaking()

	async def disconnect(self, close_code):
		if self.tournament_id in TournamentConsumer.tournaments:
			participants = TournamentConsumer.tournaments[self.tournament_id]['participants']
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
			participants = TournamentConsumer.tournaments[self.tournament_id]['participants']
			await self.send(text_data=json.dumps({
				'type': 'get_participants',
				'participants': participants
			}))

	async def matchmaking(self):
		# Send a message to GameManager to create games
		await self.channel_layer.group_send(
			'game_manager',  # Send to the GameManager group
			{
				'type': 'create_games',
				'tournament_group': self.group_name
			}
		)

	async def tournament_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))

	async def tournament_games_created(self, event):
		# Receive the created game IDs from GameManager and send to players
		await self.send(text_data=json.dumps({
			'type': 'tournament_full',
			'matching_1': [TournamentConsumer.tournaments[self.tournament_id]['participants'][0], TournamentConsumer.tournaments[self.tournament_id]['participants'][1]],
			'matching_2': [TournamentConsumer.tournaments[self.tournament_id]['participants'][2], TournamentConsumer.tournaments[self.tournament_id]['participants'][3]],
			'gameID_1': event['gameID_1'],
			'gameID_2': event['gameID_2']
		}))