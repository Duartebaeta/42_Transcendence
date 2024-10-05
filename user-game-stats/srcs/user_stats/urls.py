from django.urls import path

from user_stats.views.match import Match
from user_stats.views.user import User
from user_stats.views.tournament import Tournament

urlpatterns = [
	path('user/', User.as_view(), name='user'),
	path('match/', Match.as_view(), name='match'),
	path('tournament/', Tournament.as_view(), name='tournament'),
]
