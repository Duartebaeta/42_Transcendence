import requests
from shared.util import load_json_request

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User
from user_management.jwt_manager import UserAccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class ChangeAvatar(View):
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
			user = User.objects.filter(id=user_id).first()
		except User.DoesNotExist:
			return JsonResponse(status=400, data={'errors': ['User does not exist']})
		
		new_avatar = json_request.get('new_avatar')
		if new_avatar is None or new_avatar == '':
			return JsonResponse(status=400, data={'errors': ['No new avatar was given']})
		
		user.avatar = new_avatar
		if not self.update_avatar(user_id, new_avatar):
			return JsonResponse(status=400, data={'errors': ['Error while updating avatar in other micro services']})
		try:
			user.save()
		except Exception as e:
			JsonResponse(status=500, data={'errors': [str(e)]})
		return JsonResponse(status=200, data={'message': 'Avatar changed succesfully'})

	@staticmethod
	def update_avatar(user_id, new_avatar):
		urls = ["http://127.0.0.1:8080/user_stats/user/",
				# "http://127.0.0.1:9000/rooms/user"
				]
		headers = {'Content-Type': 'application/json'}
		payload = {
			'user_id': user_id,
			'new_avatar': new_avatar
		}

		try:
			for url in urls:
				response = requests.patch(url, json=payload, headers=headers)
				response.raise_for_status()
			return True
		except Exception:
			return False