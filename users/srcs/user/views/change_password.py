import json

from django.http import JsonResponse

from django.contrib.auth.hashers import (check_password, make_password)

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User
from user_management.utils import is_valid_password

@method_decorator(csrf_exempt, name='dispatch')
class ChangePassword(View):
	@csrf_exempt
	def post(self, request):
		# TODO: verify what user is with JWT and get the id
		try:
			user_id = 1
			json_request = json.loads(request.body.decode('utf-8'))
			user = User.objects.get(id=user_id)
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})
		except User.DoesNotExist:
			return JsonResponse(status=400, data={'errors': ['User does not exist']})
		# TODO: handle exceptions from JWT management

		new_password = json_request['new_password']
		if check_password(password=new_password, encoded=user.password):
			return JsonResponse(status=400, data={'errors': ['New password must be different from the previous one.... are you okay?']}) 
		
		is_valid, error = is_valid_password(new_password)
		if not is_valid:
			return JsonResponse(status=400, data={f'errors': [error]})
		
		user.password = make_password(new_password)
		user.save(update_fields=["password"])
		return JsonResponse(status=200, data={'message': 'Password was updated! Nice job team'})