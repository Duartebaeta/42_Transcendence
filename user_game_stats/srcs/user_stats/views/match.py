from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_stats.models import User
from user_stats.models import Match as MatchModel
from shared.jwt_manager import AccessJWTManager

@method_decorator(csrf_exempt, name='dispatch')
class Match(View):
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
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse(status=400, data={'errors': ['There is no user wwith suck id (who are you scammer?)']})

		if request.body:
			json_request, err = load_json_request(request)
			if err is not None:
				return JsonResponse(status=400, data={'errors': [err]})
			
			username = json_request.get('username')
			if username is None or username == '':
				return JsonResponse(status=400, data={'errors': ['No username was given']})
			
			user = User.objects.filter(username=username).first()
			if user is None:
				return JsonResponse(status=400, data={'errors': ["There's no such user with that username"]})
		else:
			user = User.objects.filter(id=user_id).exists()
		
		last_matches = MatchModel.objects.filter(player=user).order_by("-time")[:10]
		last_matches_info = []
		for match in last_matches:
			if match.won:
				outcome = 'Victory'
			else:
				outcome = 'Loss'
			result = {
				'outcome': outcome,
				'score': f"{match.player_score}-{match.opponent_score}",
				'opponent': match.opponent.username
			}
			last_matches_info.append(result)
		return JsonResponse(status=200, data={'games': last_matches_info})

	@csrf_exempt
	def post(self, request):
		json_request, err = load_json_request(request)
		if err is not None:
			return JsonResponse(status=400, data={'errors': [err]})

		player_id = json_request.get('player')
		opponent_id = json_request.get('opponent')
		won = json_request.get('won')
		player_score = json_request.get('player_score')
		opponent_score = json_request.get('opponent_score')
		#time = json_request.get('time')

		success, error = Match.verify_all_infos(
			player_id=player_id,
			opponent_id=opponent_id,
			won=won,
			player_score=player_score,
			opponent_score=opponent_score
			)
		if not success:
			return JsonResponse(status=400, data={'errors': [error]})

		player = User.objects.filter(id=player_id).first()
		opponent = User.objects.filer(id=opponent_id).first()
		try:
			player_match = MatchModel.create(
				player=player,
				opponent=opponent,
				won=won,
				player_score=player_score,
				opponent_score=opponent_score,
				#time
			)
			opponent_match = MatchModel.create(
				player=opponent,
				opponent=player,
				won=not won,
				player_score=opponent_score,
				opponent_score=player_score,
				#time
			)
			if won:
				player.wins += 1
				opponent.losses += 1
			else:
				player.losses += 1
				opponent.wins += 1
			player_match.save()
			opponent_match.save()
			player.save()
			opponent.save()
		except Exception as e:
			return JsonResponse(status=400, data={'errors': [str(e)]})
		return JsonResponse(status=200)

	@staticmethod
	def verify_all_infos(self, player_id, opponent_id, won, player_score, opponent_score):
		success, error = self.verify_players_id(player_id)
		if not success:
			return False, error
		success, error = self.verify_players_id(opponent_id)
		if not success:
			return False, error
		if player_id == opponent_id:
			return False, 'Player and opponent ids are the same(wtf how do you play against yourself)'
		if won is None or won == '':
			return False, 'No indication of who won given'
		if not isinstance(won, bool):
			return False, 'Indication of who won must be with a bool'
		success, error = self.verify_players_scores(player_score)
		if not success:
			return False, error
		success, error = self.verify_players_scores(opponent_score)
		if not success:
			return False, error
		#TODO: Verify if time valid
		return True, None

	@staticmethod
	def verify_players_id(id):
		if id is None or id == '':
			return False, 'No user id was given'
		if not isinstance(id, int):
			return False, "Given user id is not a 'int'"
		if id < 0:
			return False, 'Given user id is not possible'
		if not User.objects.filter(id=id).exists():
			return False, 'No user with such id'
		return True, None

	@staticmethod
	def verify_players_scores(score):
		if score is None or score == '':
			return False, 'No score was given'
		if not isinstance(score, int):
			return False, "Score is not of type 'int'"
		if score < 0:
			return False, 'Given score was invalid'
		return True, None
