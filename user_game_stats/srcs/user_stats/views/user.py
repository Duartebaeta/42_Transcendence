import json

from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_stats.models import Match
from user_stats.models import User as UserModel
from shared.jwt_manager import AccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class User(View):
	@csrf_exempt
	def post(self, request):
		json_request, err = load_json_request(request)
		if err is not None:
			return err

		user_id = json_request.get('user_id')
		username = json_request.get('username')

		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user_id was given']})
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given']})
		if not isinstance(user_id, int) or user_id < 0:
			return JsonResponse(status=400, data={'errors': ['Given user_id is not valid']})

		if UserModel.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['User already exists with the same user_id']})

		user = UserModel.objects.create(id=user_id)
		user.username = username
		try:
			user.save()
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=201, data={'message': 'user created'})

	@csrf_exempt
	def get(self, request):
		access_token = request.get('Authorization').split(' ')[1]
		if access_token is None:
			return JsonResponse(status=401, data={'errors': ['No access token given']})
		success, decoded_token, errors = AccessJWTManager.authenticate(access_token)
		if not success:
			return JsonResponse(status=401, data={'errors': errors})
		user_id = decoded_token.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user id in the give token']})
		if not UserModel.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user with such id(who are you scammer?)']})

		json_request, err = load_json_request(request)
		if err is not None:
			return err

		username = json_request.get('username')
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given (no stats for you naugthy)']})

		user = UserModel.objects.filter(username=username).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username(How did you even do that)']})

		last_matches_points = get_last_five_matches(user.id)
		data = {
			'gamesPlayed': usuer.wins + user.losses,
			'wins': user.wins,
			'losses': user.losses,
			'tournamentWins': user.tournament_wins,
			'points': last_matches_points,
		}
		return JsonResponse(status=200, data=data)

	#Might not use because post of match updates users either way
	@csrf_exempt
	def patch(self, request):
		json_request, err = load_json_request(request)
		if err is not None:
			return err

		user_id = json_request.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No such user id was given (what the hell)']})
		user = UserModel.objects.filter(id=user_id).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that user id(How did you even do that)']})
		success, errors = update_user_stats(user, json_request)
		if not success:
			return JsonResponse(status=400, data={'errors': [errors]})
		try:
			user.save(update_fields=['wins', 'losses'])
		except Exception as e:
			return Json(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=200)

	@staticmethod
	def update_user_stats(user, stats):
		# For now only updatable field is game lost or won
		won = stats.get('won')

		if won is None or won == '':
			return False, 'No information about who won the match'
		if not isinstance(won, bool):
			return False, 'Information of who won is not a bool'
		if won:
			user.wins += 1
		else:
			user.losses += 1
		return True, None


	@staticmethod
	def get_last_five_matches(user_id):
		last_matches = Match.objects.filter(id=user.id).order_by("-time")[:5]
		last_matches_points = []

		for match in last_matches:
			last_matches_points.append(match['player_score'])

		return last_matches_points.reverse()
