# tournament_consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from .consumers import TournamentConsumer
import json

class SpecificTournamentConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
		self.display_name = self.scope['url_route']['kwargs']['display_name']
		self.group_name = f'tournament_{self.tournament_id}'

		await self.channel_layer.group_add(
			self.group_name,
			self.channel_name
		)

		await self.accept()
		TournamentConsumer.tournaments[self.tournament_id]['participants'].append(self.display_name)
		print(f"{self.display_name} connected to tournament {self.tournament_id}")

	async def disconnect(self, close_code):
		# Remove user from the tournament participants
		if self.tournament_id in TournamentConsumer.tournaments:
			participants = TournamentConsumer.tournaments[self.tournament_id]['participants']
			if self.display_name in participants:
				participants.remove(self.display_name)
			# Optionally remove the tournament if no participants remain
			if not participants:
				del TournamentConsumer.tournaments[self.tournament_id]
		await self.channel_layer.group_discard(
			self.group_name,
			self.channel_name
		)
		print(f"{self.display_name} disconnected from tournament {self.tournament_id}")

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')

		if message_type == 'tournament_message':
			# Broadcast the message to all players in the tournament
			await self.channel_layer.group_send(
				self.group_name,
				{
					'type': 'tournament_message',
					'message': data
				}
			)
		elif message_type == 'get_participants':
			# Send the list of participants to the user
			participants = TournamentConsumer.tournaments[self.tournament_id]['participants']
			await self.channel_layer.group_send(
				self.group_name,
				{
					'type': 'send_participants',  # This is the function name that will be called in each consumer
					'participants': participants
				}
			)

	async def send_participants(self, event):
		# This method is called when we send a group message
		participants = event['participants']
		
		# Send the list of participants to this specific consumer
		await self.send(text_data=json.dumps({
			'type': 'get_participants',
			'participants': participants
	}))

	async def tournament_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))
