from django.urls import path
from .consumers import GameConsumer
from .consumers import TournamentConsumer

websocket_urlpatterns = [
	path('ws/game/<str:game_id>/<str:username>/', GameConsumer.as_asgi()),
	path('ws/tournament/<str:tournament_id>/<str:display_name>/', TournamentConsumer.as_asgi()),
]
