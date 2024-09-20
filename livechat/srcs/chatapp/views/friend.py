import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from shared.util import load_json_request

from chatapp.models import User, BlockedUser, Friend

from shared.jwt_manager import AccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class FriendView(View):
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

		friendUsername = json_request.get('user')
		if friendUsername is None or friendUsername == '':
			return JsonResponse(status=400, data={'errors': ['No username given to friend a user(How do i know who you wanna friend dumb dumb)']})
		userFriend = User.objects.filter(username=friendUsername).first()
		if userFriend is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username']})

		user1 = User.objects.filter(id=min(user_id, userFriend.id)).first()
		if user1 is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that id']})
		user2 = User.objects.filter(id=max(user_id, userFriend.id)).first()

		try:
			friend, new = Friend.objects.get_or_create(user1=user1, user2=user2)
			if not new:
				return JsonResponse(status=400, data={'errors': ['Already friends']})
			friend.save()
			return JsonResponse(status=201, data={'message': 'Friendship created'})
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})

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

		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		UnfriendUsername = json_request.get('user')
		if UnfriendUsername is None or UnfriendUsername == '':
			return JsonResponse(status=400, data={'errors': ['No username given to friend a user(How do i know who you wanna unfriend dumb dumb)']})
		userUnfriend = User.objects.filter(username=UnfriendUsername).first()
		if userUnfriend is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username']})

		user1 = User.objects.filter(id=min(user_id, userUnfriend.id)).first()
		if user1 is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that id']})
		user2 = User.objects.filter(id=max(user_id, userUnfriend.id)).first()

		try:
			friend = Friend.objects.get(user1=user1, user2=user2)
			friend.delete()
			return JsonResponse(status=201, data={'message': 'Friendship deleted'})
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
