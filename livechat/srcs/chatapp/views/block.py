import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from chatapp.models import User, BlockedUsers

from shared.jwt_manager import AccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class BlockUser(View):
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

		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})
		
		blocked_username = json_request.get('user')
		if blocked_username is None or blocked_username == '':
			return JsonResponse(status=400, data={'errors': ['No username given to block a user(How do i know who you wanna block dumb dumb)']})
		blocking_user = User.objects.filter(id=user_id).first()
		if blocking_user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that id']})
		
		blocked_user = User.objects.filter(username=blocked_username).first()
		if blocked_user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username']})
		
		try:
			block = BlockedUsers.objects.create(blocker=blocked_user, blocked=blocked_user)
			block.save()
			return JsonResponse(status=201, data={'message': 'User created'})
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
	
	@csrf_exempt
	def delete(self, request):
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

		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})
		
		unblock_username = json_request.get('user')
		if unblock_username is None or unblock_username == '':
			return JsonResponse(status=400, data={'errors': ['No username given to unblock bruuh']})
		
		user = User.objects.filter(id=user_id).first()
		blocked_user = User.objects.filter(username=unblock_username)

		block = BlockedUsers.objects.filter(blocker=user, blocked=blocked_user).first()
		if block is None:
			return JsonResponse(status=400, data={'errors': ["You didn't block the user or the user blocked you instead(you naugthy)"]})
		block.delete()
		return JsonResponse(status=200, data={'message': 'user unblocked'})
