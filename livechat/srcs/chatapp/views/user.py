import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from chatapp.models import User as UserModel
from chatapp.models import ChatRoom
from django.db.models import Q

from shared.jwt_manager import AccessJWTManager
from shared.util import load_json_request

@method_decorator(csrf_exempt, name='dispatch')
class User(View):
	@csrf_exempt
	def get(self, request):
		access_token = request.headers.get('Authorization').split(' ')[1]
		if access_token is None:
			return JsonResponse(status=401, data={'errors': ['No access token given']})
		success, decoded_token, errors = AccessJWTManager.authenticate(access_token)
		if not success:
			return JsonResponse(status=401, data={'errors': errors})
		user_id = decoded_token.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user id in the give token']})
		if not UserModel.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user with such id(who are you scammer?)']})

		user = UserModel.objects.filter(id=user_id).first()
		chatrooms = ChatRoom.objects.filter(Q(user1=user) | Q(user2=user))
		contacts = []
		friends = []
		for chat in chatrooms:
			if user == chat.user1:
				contact = chat.user2
			else:
				contact = chat.user1

			last_message_sent = chat.messages.filter(user=contact).order_by('-date').first()
			if last_message_sent is None:
				last_message = ''
			else:
				last_message = last_message_sent.message
			
			if user.friend1.filter(user2=contact).exists() or user.friend2.filter(user1=contact).exists():
				friend = True
			else:
				friend = False
			if user.blocking.filter(blocked=contact).exists() or contact.blocking.filter(blocked=user).exists():
				blocked = True
			else:
				blocked = False
			if not blocked:
				result = {
					'name': contact.username,
					'last_message': last_message,
					'friend': friend,
				}
				if friend:
					friends.append(result)
				contacts.append(result)

		return JsonResponse(status=200, data={'contacts': contacts, 'friends': friends})

	@csrf_exempt
	def post(self, request):
		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		user_id = json_request.get('user_id')
		username = json_request.get('username')

		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user_id was given']})
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given']})
		if not isinstance(user_id, int) or user_id < 0:
			return JsonResponse(status=400, data={'errors': ['Given user_id is not valid']})

		if UserModel.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['User already exists with the same user_id']})
		if UserModel.objects.filter(username=username).exists():
			return JsonResponse(status=400, data={'errors': ['Already exist a user with the same username']})

		user = UserModel.objects.create(id=user_id)
		user.username = username
		try:
			user.save()
			other_users = UserModel.objects.exclude(id=user_id)
			for other in other_users:
				user1 = UserModel.objects.filter(id=min(user_id, other.id)).first()
				user2 = UserModel.objects.filter(id=max(user_id, other.id)).first()
				chatroom = ChatRoom.objects.create(user1=user, user2=other, name=f'{user1.id}-{user2.id}')
				chatroom.save()
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=201, data={'message': 'user created'})

	@csrf_exempt
	def patch(self, request):
		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		user_id = json_request.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No such user id was given (what the hell)']})
		user = UserModel.objects.filter(id=user_id).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that user id(How did you even do that)']})

		new_username = json_request.get('new_username')

		if new_username is not None:
			user.username = new_username

		try:
			user.save(update_fields=['username'])
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=200, data={'message': 'Password changed successfully, yipeeee'})
