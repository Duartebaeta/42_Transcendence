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

			success, err = self.create_user_db(user.id, user.username, user.avatar)
			if not success:
				return HttpResponseBadRequest(err)

			# if not self.create_user_db(user.id, user.username, user.avatar):
			# 	return HttpResponseBadRequest("Some error occured while creating user")
			user.emailVerified = True
			user.save()
			messages.success(request, 'Your account has been activated.')
		else :
			messages.error(request, 'The confirmation link was invalid, possibly because it has already been used.')
		return redirect('https://10.12.244.159/index.html')

	@staticmethod
	@csrf_exempt
	def create_user_db(user_id, username, avatar):
		urls = ["http://user-stats:8080/user-stats/user/",
				"http://livechat:9000/rooms/user/"
				]
		headers = {'Content-Type': 'application/json'}
		payload = {
			'user_id': user_id,
			'username': username,
			'avatar': avatar
		}

		for url in urls:
			response = requests.post(url=url, json=payload, headers=headers)
			if not (response.status_code == 201):
				return False, response.text
		return True, None