from django.http import JsonResponse

def game_status(request):
    return JsonResponse({"status": "Game API running"})
