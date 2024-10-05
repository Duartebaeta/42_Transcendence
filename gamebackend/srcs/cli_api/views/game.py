from shared.util import load_json_request

from django.http import JsonResponse

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from gameapi.consumers import GameManager


@method_decorator(csrf_exempt, name='dispatch')
class Game(View):
    @csrf_exempt
    def post(self, request):
        print(f"I was here {request}")
        json_request, err = load_json_request(request)
        if err is not None:
            return JsonResponse(status=400, data={'errors': [err]})
        
        game_id = json_request.get('game_id')
        if game_id is None or game_id == '':
            return JsonResponse(status=400, data={'errors': ['No game id was given wtfff']})
        
        if game_id not in GameManager.games:
            return JsonResponse(status=400, data={'errors': ['Game ID not valid']})
        game_state = GameManager.games[game_id].get_cli_state()
        return JsonResponse(status=200, data={'game_state': game_state})
