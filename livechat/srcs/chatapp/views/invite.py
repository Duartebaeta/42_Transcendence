import json

from django.http import JsonResponse
from shared.util import load_json_request

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from chatapp.models import User, ChatRoom, ChatMessage

from shared.jwt_manager import AccessJWTManager
from shared.util import load_json_request

@method_decorator(csrf_exempt, name='dispatch')
class Invite(View):
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
			return JsonResponse(status=400, data={'errors': ['No user id in the give token']})
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user with such id(who are you scammer?)']})
		user = User.objects.get(id=user_id)

		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})
		other_username = json_request.get('username')
		if other_username is None or other_username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given']})
		other_user = User.objects.filter(username=other_username).first()
		if other_user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username']})
		
		if user.id < other_user.id:
			chatroom_name = f'{user.id}-{other_user.id}'
		else:
			chatroom_name = f'{other_user.id}-{user.id}'
		chatroom = ChatRoom.objects.filter(name=chatroom_name).first()
		if chatroom is None:
			return JsonResponse(status=400, data={'errors': ['No chatroom was found']})
		
		game_id = json_request.get('game_id')
		if game_id is None or game_id == '':
			return JsonResponse(status=400, data={'errors': ['No game id was given']})
		
		message = f'Join my game: {game_id}'
		chat_message = ChatMessage.objects.create(user=user, room=chatroom, message=message)
		try:
			chat_message.save()
			return JsonResponse(status=200, data={'message': message})
		except Exception as e:
			return JsonResponse(status=400, data={'errros': [str(e)]})