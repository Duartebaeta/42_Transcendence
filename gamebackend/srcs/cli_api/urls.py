from django.urls import path

from cli_api.views.game import Game

urlpatterns = [
    path('info/', Game.as_view(), name='info'),
]