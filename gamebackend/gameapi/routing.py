from django.urls import path
from django.urls import re_path
from .consumers import GameConsumer
from .consumers import TournamentConsumer
from .tournament_consumers import SpecificTournamentConsumer
from .consumers import GameManager

websocket_urlpatterns = [
	path('ws/game/<str:game_id>/<str:username>/', GameConsumer.as_asgi()),
	re_path(r'ws/GameManager/$', GameManager.as_asgi()),
	re_path(r'ws/tournament/$', TournamentConsumer.as_asgi()),
	re_path(r'ws/tournament/(?P<tournament_id>\w+)/(?P<display_name>\w+)/$', SpecificTournamentConsumer.as_asgi()),
]
