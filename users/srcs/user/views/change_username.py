import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User
from user_management.utils import is_valid_username

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

		try:
			json_request = json.loads(request.body.decode('utf-8'))
			user = User.objects.get(id=user_id)
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})
		except User.DoesNotExist:
			return JsonResponse(status=400, data={'errors': ['User does not exist']})
		# TODO: handle exceptions from JWT management

		new_username = json_request['new_username']
		if user.username == new_username:
			return JsonResponse(status=400, data={'errors': ['New username must be different of the current one, Dummy :p']})

		is_valid, error = is_valid_username(new_username)
		if not is_valid:
			return JsonResponse(status=400, data={f'errors': [error]})

		user.username = new_username;
		user.save(update_fields=["username"])
		# Send update to User in user_stats
		return JsonResponse(status=200, data={'message': 'Username changed :) great job'})
