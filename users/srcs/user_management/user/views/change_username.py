import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User
from user_management.utils import is_valid_username

@method_decorator(csrf_exempt, name='dispatch')
class ChangeUsername(View):
	@csrf_exempt
	def post(self, request):
		# TODO: verify what user it is with JWT and get the id
		try:
			user_id = 1 #get_user_id or something
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
		return JsonResponse(status=200, data={'message': 'Username changed :) great job'})
