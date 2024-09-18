import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from chatapp.models import User as UserModel
from chatapp.models import ChatRoom
from django.db.models import Q

from shared.jwt_manager import AccessJWTManager

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

		user = UserModel.objects.get(user_id)
		chatrooms = ChatRoom.objects.filter(Q(user1=user) | Q(user2=user))
		contacts = []
		for chat in chatrooms:
			if user == chat.user1:
				contact = chat.user2.username
			else:
				contact = chat.user1.username
			last_message = chat.messages.filter(user=contact).order_by('-date').first()
			if last_message is None:
				last_message = ''
			result = {
				'contact': contact,
				'last_message': last_message,
			}
			contacts.append(result)

		return JsonResponse(status=200, data={'contacts': contacts})

	@csrf_exempt
	def post(self, request):
		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})

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
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=201, data={'message': 'user created'})
