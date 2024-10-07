from django.urls import path
from django.urls import re_path
from .consumers import GameConsumer
from .consumers import TournamentConsumer
from .tournament_consumers import SpecificTournamentConsumer
from .consumers import GameManager

websocket_urlpatterns = [
	path('ws/gamebackend/game/<str:game_id>/<str:userID>/', GameConsumer.as_asgi()),
	re_path(r'ws/gamebackend/GameManager/$', GameManager.as_asgi()),
	re_path(r'ws/gamebackend/tournament/$', TournamentConsumer.as_asgi()),
	re_path(r'ws/gamebackend/tournament/(?P<tournament_id>\w+)/(?P<display_name>\w+)/$', SpecificTournamentConsumer.as_asgi()),
]
