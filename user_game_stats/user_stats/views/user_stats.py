import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_stats.models import User, Match

@method_decorator(csrf_exempt, name='dispatch')
class UserStats(View):
	@csrf_exempt
	def get(self, request):
		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})

		username = json_request.get('username')
		if username if None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given, how am i suppose to give you their stats']})
		try:
			user = User.objects.get(username=username)
		x
