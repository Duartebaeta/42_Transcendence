from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.utils.http import urlsafe_base64_decode
from user.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib import messages
from django.shortcuts import redirect

from django.http import HttpResponseBadRequest

import requests

@method_decorator(csrf_exempt, name='dispatch')
class Activate(View):
	@csrf_exempt
	def get(self, request, uidb64, token):
		try:
			uid = urlsafe_base64_decode(uidb64).decode()
			user = User.objects.get(pk=uid)
		except(TypeError, ValueError, OverflowError, User.DoesNotExist):
			user = None
		if user is not None and default_token_generator.check_token(user, token):
			if not self.create_user(user.id, user.username, user.avatar):
				return HttpResponseBadRequest("Some error occured while creating user")
			user.emailVerified = True
			user.save()
			messages.success(request, 'Your account has been activated.')
		else :
			messages.error(request, 'The confirmation link was invalid, possibly because it has already been used.')
		return redirect('http://localhost:3000/')

	@staticmethod
	def create_user(user_id, username, avatar):
		urls = ["http://127.0.0.1:8080/user_stats/user/",
				# "http://127.0.0.1:9000/rooms/user/"
				]
		headers = {'Content-Type': 'application/json'}
		payload = {
			'user_id': user_id,
			'username': username,
			'avatar': avatar
		}
		try:
			for url in urls:
				response = requests.post(url, json=payload, headers=headers) # Sends the post request to User_Stats api
				response.raise_for_status()
			return True
		except Exception:
			return False
