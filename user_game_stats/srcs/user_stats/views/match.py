from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from user_stats.models import User, Match


@method_decorator(csrf_exempt, name='dispatch')
class Match(View):
	@csrf_exempt
	def post(self, request):
		json_request, err = load_json_request(request)
		if err is not None:
			return err

		player_id = json_request.get('player')
		opponent_id = json_request.get('opponent')
		won = json_request.get('won')
		player_score = json_request.get('player_score')
		opponent_score = json_request.get('opponent_score')
		#time = json_request.get('time')

		success, error = verify_all_infos(
			player_id,
			opponent_id,
			won,
			player_score,
			opponent_score
		)
		if not success:
			return JsonResponse(status=400, data={'errors': [error]})

		player = User.objects.filter(id=player_id).first()
		opponent = User.objects.filer(id=opponent_id).first()
		try:
			player_match = Match.create(
				player,
				opponent,
				won,
				player_score,
				opponent_score,
				#time
			)
			opponent_match = Match.create(
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
	def verify_all_infos(player_id, opponent_id, won, player_score, opponent_score):
		success, error = verify_players_id(player_id)
		if not success:
			return False, error
		success, error = verify_players_id(opponeny_id)
		if not success:
			return False, error
		if player_id == opponent_id:
			return False, 'Player and opponent ids are the same(wtf how do you play against yourself)'
		if won is None or won == '':
			return False, 'No indication of who won given'
		if not isinstance(won, bool):
			return False, 'Indication of who won must be with a bool'
		success, error = verify_players_scores(player_score)
		if not success:
			return False, error
		success, error = verify_players_scores(opponent_score)
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
