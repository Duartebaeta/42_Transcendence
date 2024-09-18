from shared.util import load_json_request

from django.http import JsonResponse

from django.contrib.auth.hashers import check_password

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from django.db.models import Model
from user.models import User

from user_management.jwt_manager import RefreshJWTManager, UserAccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class SignIn(View):
	@csrf_exempt
	def post(self, request):
		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})
		try:
			user_email = json_request.get('email')
			if user_email is None or user_email == '':
				return JsonResponse(status=400, data={'errors': ['No email was given']})
			user = User.objects.get(email=user_email)
			if not user.emailVerified:
				return JsonResponse(status=400, data={'errors': ["You didn't verify your email :("]})
		except User.DoesNotExist:
			return JsonResponse(status=400, data={'errors': ['No User with such email']})

		user_password = json_request.get('password')
		if user_password is None or user_password == '':
			return JsonResponse(status=400, data={'errors': ['No password was given(How am i suppose to login without a password)']})
		if not check_password(password=user_password, encoded=user.password):
			return JsonResponse(status=400, data={'errors': ['Wrong password']})

		success, refresh_token, errors = RefreshJWTManager.generate_token(user.id)
		if not success:
			return JsonResponse(status=500, data={'errors': errors})
		success, access_token, errors = UserAccessJWTManager.generate_token(user.id)
		if not success:
			return JsonResponse(status=500, data={'errors': errors})
		return JsonResponse(status=200, data={'refresh_token': refresh_token, 'access_token': access_token})
