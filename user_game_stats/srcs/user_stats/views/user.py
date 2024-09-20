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
			return JsonResponse(status=400, data={'errors': [err]})

		user_id = json_request.get('user_id')
		username = json_request.get('username')
		avatar = json_request.get('avatar')

		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user_id was given']})
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given']})
		if avatar is None or avatar == '':
			return JsonResponse(status=400, data={'errorr': ['No avatar was given(i wanna see your face tf)']})
		if not isinstance(user_id, int) or user_id < 0:
			return JsonResponse(status=400, data={'errors': ['Given user_id is not valid']})

		if UserModel.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['User already exists with the same user_id']})

		user = UserModel.objects.create(id=user_id)
		user.username = username
		user.avatar = avatar
		try:
			user.save()
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=201, data={'message': 'user created'})

	@csrf_exempt
	def get(self, request):
		access_token = request.headers.get('Authorization').split(' ')[1]
		if access_token is None:
			return JsonResponse(status=401, data={'errors': ['No access token given']})
		success, decoded_token, errors = AccessJWTManager.authenticate(access_token)
		if not success:
			return JsonResponse(status=401, data={'errors': errors})
		user_id = decoded_token.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No user id in the given token']})
		if not UserModel.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user with such id(who are you scammer?)']})

		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		username = json_request.get('username')
		if username is None or username == '':
			return JsonResponse(status=400, data={'errors': ['No username was given (no stats for you naugthy)']})

		user = UserModel.objects.filter(username=username).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that username(How did you even do that)']})

		last_matches_points = self.get_last_five_matches(user.id)
		data = {
			'username': user.username,
			'avatar': user.avatar,
			'gamesPlayed': user.wins + user.losses,
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
			return JsonResponse(status=400, data={'errors': [err]})

		user_id = json_request.get('user_id')
		if user_id is None or user_id == '':
			return JsonResponse(status=400, data={'errors': ['No such user id was given (what the hell)']})
		user = UserModel.objects.filter(id=user_id).first()
		if user is None:
			return JsonResponse(status=400, data={'errors': ['No such user with that user id(How did you even do that)']})

		new_username = json_request.get('new_username')
		new_avatar = json_request.get('new_avatar')

		if new_username is not None:
			user.username = new_username
		if new_avatar is not None:
			user.avatar = new_avatar
		
		try:
			user.save(update_fields=['username', 'avatar'])
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=200, data={'message': 'Successfully update informations'})

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
		last_matches = Match.objects.filter(id=user_id).order_by("-time")[:5]
		last_matches_points = []

		for match in last_matches:
			last_matches_points.append(match['player_score'])

		return last_matches_points.reverse()
