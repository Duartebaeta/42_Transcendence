import json

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_stats.models import User, Match

@method_decorator(csrf_exempt, name='dispatch')
class User(View):
	@csrf_exempt
	def post(request):
		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})

		user_id = json_request.get('user_id')
		username = json_request.get('username')

		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user_id was given']})
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given']})
		if not isinstance(user_id, int) or user_id < 0:
			return JsonResponse(status=400, data={'errors': ['Given user_id is not valid']})

		if User.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data=['errors': ['User already exists with the same user_id']])

		user = User.objects.create(id=user_id)
		user.username = username
		try:
			user.save()
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [e]})
		return JsonResponse(status=201)

	@csrf_exempt
	def get(request):
		try:
			json_request = json.loads(request.body.decode('utf-8'))
		except UnicodeDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid UTF-8 encoded bytes']})
		except json.JSONDecodeError:
			return JsonResponse(status=400, data={'errors': ['Invalid JSON data format']})

		username = json_request.get('username')
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given (no stats for you naugthy)']})

		user = User.objects.filter(username=username).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username(How did you even do that)']})

		last_matches_points = get_last_five_matches(user.id)
		data = {
			'gamesPlayed': user.wins + user.losses,
			'wins': user.wins,
			'losses': user.losses,
			'tournamentWins': user.tournament_wins,
			'points': last_matches_points,
		}

		return JsonResponse(status=200, data)

	@static_method
	def get_last_five_matches(user_id):
		last_matches = Match.objects.filter(id=user.id).order_by("-time")[:5]
		last_matches_points = []

		for match in last_matches:
			last_matches_points.append(match['player_score'])

		return last_matches_points.reverse()
