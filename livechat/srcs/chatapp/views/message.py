import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from shared.util import load_json_request

from chatapp.models import User, ChatRoom, ChatMessage, BlockedUser

from shared.jwt_manager import AccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class MessageView(View):
	@csrf_exempt
	def post(self, request):
		access_token = request.headers.get('Authorization').split(' ')[1]
		if access_token is None:
			return JsonResponse(status=401, data={'errors': ['No access token given']})
		success, decoded_token, errors = AccessJWTManager.authenticate(access_token)
		if not success:
			return JsonResponse(status=401, data={'errors': errors})
		user_id = decoded_token.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user id in the given token']})
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user with such id(Where did you get this boy -.-)']})

		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		roomName = json_request.get('room_name')
		if roomName is None or roomName == '':
			return JsonResponse(status=400, data={'errors': ['No room name given']})

		receiver_id = int(roomName.replace(str(user_id) + '-', ''))

		block = BlockedUser.objects.filter(blocker=receiver_id, blocked=user_id).first()
		if block is not None:
			return JsonResponse(status=400, data={'errors': ['You are blocked by this user']})

		message = json_request.get('message')
		if message is None or message == '':
			return JsonResponse(status=400, data={'errors': ['No message given']})

		user = User.objects.filter(id=user_id).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that id']})

		try:
			chatroom = ChatRoom.objects.get(name=roomName)
		except ChatRoom.DoesNotExist:
			return JsonResponse(status=400, data={'message': 'Chatroom not created'})
		message = ChatMessage.objects.create(user=user, room=chatroom, message=message)
		message.save()
		return JsonResponse(status=200, data={'message': message.message})
