
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.utils.http import urlsafe_base64_decode
from user.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib import messages
from django.shortcuts import redirect

@method_decorator(csrf_exempt, name='dispatch')
class Activate(View):
	@csrf_exempt
	def get(self, request, uidb64, token):
		try:
			uid = urlsafe_base64_decode(uidb64).decode()
			user = User._default_manager.get(pk=uid)
		except(TypeError, ValueError, OverflowError, User.DoesNotExist):
			user = None
		if user is not None and default_token_generator.check_token(user, token):
			user.emailVerified = True
			user.save()
			messages.success(request, 'Your account has been activated.')
		else :
			messages.error(request, 'The confirmation link was invalid, possibly because it has already been used.')
		# TODO: return a success page
		return redirect('http://localhost:3000/')
