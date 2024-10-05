from django.http import JsonResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import uuid

def game_status(request):
	return JsonResponse({"status": "Game API running"})

tournaments = {}

@require_http_methods(["GET"])
def check_tournament(request, tournament_id):
	if tournament_id in tournaments:
		return JsonResponse({"status": "exists"})
	else:
		return HttpResponseNotFound("Tournament not found")

@require_http_methods(["POST"])
def create_tournament(request):
	tournament_id = str(uuid.uuid4())[:8]
	tournaments[tournament_id] = {
		"players": []
	}
	return JsonResponse({"tournamentID": tournament_id})
