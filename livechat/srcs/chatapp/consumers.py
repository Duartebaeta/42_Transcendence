from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
from .models import ChatRoom, ChatMessage, User

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = 'chat_%s' % self.room_name

	# Join room group
		await self.channel_layer.group_add(
	 		self.room_group_name,
	 		self.channel_name
	)

		await self.accept()

	async def disconnect(self, code):
	# Leave room group
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		data = json.loads(text_data)
		message = data['message']
		userName = data['username']
		room = data['room']

	# Send message to room group
		await self.channel_layer.group_send(
		    self.room_group_name,
		    {
		    'type': 'chat_message',
		    'message': message,
		    'username': userName,
		    'room': room
		    }
		)

		await self.save_message(message, userName, room)

	async def chat_message(self, event):
		message = event['message']
		userName = event['username']
		room = event['room']
		print(f'Message: {message}| userName: {userName}')
		# Send message to WebSocket
		await self.send(text_data=json.dumps({
		    'message': message,
		    'username': userName,
		    'room': room
		}))

	@sync_to_async
	def save_message(self, message, username, room):
		user = User.objects.get(username=username)
		room = ChatRoom.objects.get(name=room)

		ChatMessage.objects.create(user=user, room=room, message=message)


class LoginChecker(AsyncWebsocketConsumer):
	async def connect(self):
		self.user_id = self.scope['url_route']['kwargs']['user_id']
		self.username = self.scope['url_route']['kwargs']['username']

		await self.update_to_online()

		self.general_group_name = 'login_checker'

		await self.channel_layer.group_add(
	 		self.general_group_name,
	 		self.channel_name
		)

		await self.accept()

	async def disconnect(self, code):
		await self.update_to_offline()
		await self.channel_layer.group_send(
			self.general_group_name,
			{
				'type': 'disconnect',
				'username': self.username
			}
		)
		await self.channel_layer.group_discard(
			self.general_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data.type == "send_online":
			await self.channel_layer.group_send(
				self.general_group_name,
				{
					'type': 'connect',
					'username': self.username
				}
			)

	async def connect(self, event):
		userName = event['username']
		await self.send(text_data=json.dumps({
		    'type': 'new_connection',
		    'username': userName
		}))

	async def disconnect(self, event):
		userName = event['username']
		await self.send(text_data=json.dumps({
			'type': 'disconnect',
			'username': userName
		}))

	@sync_to_async
	def update_to_online(self):
		user = User.objects.filter(id=self.user_id).first()
		if user is None:
			self.close()
		user.is_online = True
		user.save()

	@sync_to_async
	def update_to_offline(self):
		user = User.objects.filter(id=self.user_id).first()
		if user is None:
			return
		user.is_online = False
		user.save()
