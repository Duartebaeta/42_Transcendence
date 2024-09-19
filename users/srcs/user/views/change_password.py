import json

from shared.util import load_json_request

from django.http import JsonResponse

from django.contrib.auth.hashers import (check_password, make_password)

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User
from user_management.utils import is_valid_password

from user_management.jwt_manager import UserAccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class ChangePassword(View):
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

		new_password = json_request['new_password']
		if check_password(password=new_password, encoded=user.password):
			return JsonResponse(status=400, data={'errors': ['New password must be different from the previous one.... are you okay?']})

		is_valid, error = is_valid_password(new_password)
		if not is_valid:
			return JsonResponse(status=400, data={f'errors': [error]})

		user.password = make_password(new_password)
		user.save(update_fields=["password"])
		return JsonResponse(status=200, data={'message': 'Password was updated! Nice job team'})
