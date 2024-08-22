import json
from datetime import datetime, timedelta, timezone

from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator

from django.core.mail import send_mail

from django.http import JsonResponse
from django.utils.http import urlsafe_base64_encode

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user.models import User
from user_management.utils import (is_valid_username, is_valid_email, is_valid_password)
from user_management import settings

@method_decorator(csrf_exempt, name='dispatch')
class SignUp(View):
	@csrf_exempt
	def post(self, request):
		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})

		errors = self.user_info_validation(json_request)
		if errors:
			return JsonResponse(status=400, data={'errors': errors})
		
		try:
			user = User.objects.create(username = json_request['username'],
							  			email = json_request['email'],
										password = make_password(json_request['password']))
		except Exception as e:
			return JsonResponse(status=400, 
					   	data={'errors': [f'It occurred an error while creating the user: {e}']})
		
		verification_link = account_verification_link(user)
		# subject = '42-Transcendence | Verify your account'
		message = f'To verify your account click on the link {verification_link}'

		try:
			send_mail(
				"42-Transcendence | Verify your account",
				message,
				settings.EMAIL_HOST_USER,
				[user.email]
			)
		except Exception as e:
			user.delete()
			return JsonResponse(
				status=400,
				data={'errors': [f'Occurred an error while trying to send a verification email : {e}']}
				)

		
		user.save()
		return JsonResponse(status=201, data={'message': 'Account created'})

	@staticmethod
	def user_info_validation(json_request):
		username  = json_request['username']
		email = json_request['email']
		password = json_request['password']

		errors = []

		valid_username, username_error =  is_valid_username(username)
		if not valid_username:
			errors.append(username_error)
		valid_email, email_error = is_valid_email(email)
		if not valid_email:
			errors.append(email_error)
		valid_password, password_error = is_valid_password(password)
		if not valid_password:
			errors.append(password_error)
		
		return errors
	
def account_verification_link(user):
	token = default_token_generator.make_token(user)
	user_id = urlsafe_base64_encode(str(user.id).encode('utf-8'))
	user.emailTokenVerification = token
	user.emailTokenVerificationExpiration = datetime.now(timezone.utc) + timedelta(hours=1)
	return f'{settings.ACTIVATE_ACCOUNT_URL}/{user_id}/{token}'