import json
import requests
from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User
from user.utils import is_valid_username

from user_management.jwt_manager import UserAccessJWTManager


@method_decorator(csrf_exempt, name='dispatch')
class ChangeUsername(View):
	@csrf_exempt
	def post(self, request):
		access_token = request.headers.get('Authorization').split(' ')[1]
		if access_token is None:
			return JsonResponse(status=400, data={'errors': ['No access token given']})
		success, user_id, errors = UserAccessJWTManager.authenticate(access_token)
		if not success:
			return JsonResponse(status=401, data={'errors': errors})
		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})
		try:
			user = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return JsonResponse(status=400, data={'errors': ['User does not exist']})

		new_username = json_request['new_username']
		if user.username == new_username:
			return JsonResponse(status=400, data={'errors': ['New username must be different of the current one, Dummy :p']})

		is_valid, error = is_valid_username(new_username)
		if not is_valid:
			return JsonResponse(status=400, data={f'errors': [error]})

		user.username = new_username;
		if not self.update_username(user.id, new_username):
			return JsonResponse(status=400, data={'errors': ["Couldn't update username on other micro-services"]})
		user.save(update_fields=["username"])
		# Send update to User in user_stats
		return JsonResponse(status=200, data={'message': 'Username changed :) great job'})

	@staticmethod
	def update_username(user_id, username):
		urls = ["http://user-stats:8080/user-stats/user/",
				"http://livechat:9000/rooms/user/"
				]
		headers = {'Content-Type': 'application/json'}
		payload = {
			'user_id': user_id,
			'new_username': username
		}

		try:
			for url in urls:
				response = requests.patch(url, json=payload, headers=headers)
				response.raise_for_status()
			return True
		except Exception:
			return False
