from django.urls import path
from . import views
from .views import check_tournament, create_tournament

urlpatterns = [
	path('status/', views.game_status, name='game-status'),
	path('api/tournament/<str:tournament_id>/', check_tournament, name='check_tournament'),
	path('api/tournament/create/', create_tournament, name='create_tournament'),
]
