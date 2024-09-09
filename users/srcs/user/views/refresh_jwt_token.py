import json
from sys import meta_path

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_management.jwt_manager import RefreshJWTManager, UserAccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class RefreshJwtToken(View):
	@csrf_exempt
	def get(self, request):
		refresh_token = request.headers.get('Authorization').split(' ')[1]
		if refresh_token is None:
			return JsonResponse(status=400, data={'errors': ['No refresh token given how am I supose to help you :((']})

		success, user_id, errors = RefreshJWTManager.authenticate(refresh_token)
		if not success or user_id is None:
			return JsonResponse(status=400, data={'errors': errors})

		success, access_token, errors = UserAccessJWTManager.generate_token(user_id)
		if not success or access_token is None:
			return JsonResponse(status=400, data={'errors': errors})

		return JsonResponse(status=200, data={'access_token': access_token})
