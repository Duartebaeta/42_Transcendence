from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User

from user_management.jwt_manager import UserAccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class Me(View):
	@csrf_exempt
	def get(self, request):
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

		data = {
			'id': user.id,
			'username': user.username,
		}
		return JsonResponse(status=200, data=data)
