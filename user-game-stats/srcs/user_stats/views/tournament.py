import json

from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_stats.models import User

@method_decorator(csrf_exempt, name='dispatch')
class Tournament(View):
	@csrf_exempt
	def post(self, request):
		json_request = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		user_id = json_request.get('user_id')

		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user_id was given']})
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['No such user with that id']})

		user = User.objects.filter(id=user_id).first()
		user.tournament_wins += 1
		try:
			user.save(update_fields=['tournament_wins'])
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=200, data={'message': 'Succesfully recorded tournament win'})