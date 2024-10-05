import json

from shared.util import load_json_request
from user_stats.utils import get_user_stats

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_stats.models import Match
from user_stats.models import User
from shared.jwt_manager import AccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class Stats(View):
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
		if not UserModel.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user with such id(who are you scammer?)']})

		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		username = json_request.get('username')
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given']})

		user = User.objects.filter(username=username).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username(are you going crazy?)']})
		data = get_user_stats(user.id)
		return JsonResponse(status=200, data=data)