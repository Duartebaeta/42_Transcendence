from django.db import models
from user_game_stats import settings

# Create your models here.
class User(models.Model):
	id = models.IntegerField(primary_key=True)
	username = models.CharField(unique=True, max_length=settings.USERNAME_MAX_LENGTH)
	avatar = models.TextField(null=True)
	wins = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)
	tournament_wins = models.IntegerField(default=0)


class Match(models.Model):
	player = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name="player")
	opponent = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="opponent")
	won = models.BooleanField(null=True)
	player_score = models.IntegerField(null=True)
	opponent_score = models.IntegerField(null=True)
	time = models.DateTimeField(auto_now=True)
