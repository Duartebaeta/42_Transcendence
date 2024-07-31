import json

from django.http import JsonResponse 

from django.contrib.auth.hashers import check_password

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from django.db.models import Model
from user.models import User

@method_decorator(csrf_exempt, name='dispatch')
class SignIn(View):
	@csrf_exempt
	def post(self, request):
		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})
		
		try:
			user = User.objects.get(email=json_request['email'])
		except User.DoesNotExist:
			return JsonResponse(status=400, data={'errors': ['No User with such email']})
		
		if not check_password(password=json_request['password'], encoded=user.password):
			return JsonResponse(status=400, data={'errors': ['Wrong password']})
		return JsonResponse(status=200)
