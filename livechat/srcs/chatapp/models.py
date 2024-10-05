from django.db import models
# from django.contrib.auth.models import User
from shared import settings as shared_settings


# Create your models here.

class User(models.Model):
	id = models.IntegerField(primary_key=True)
	username = models.CharField(unique=True, max_length=shared_settings.USERNAME_MAX_LENGTH)

class BlockedUser(models.Model):
	blocker = models.ForeignKey(User, related_name='blocking', on_delete=models.CASCADE)
	blocked = models.ForeignKey(User, related_name='blocked_by', on_delete=models.CASCADE)

	class Meta:
		unique_together = ('blocker', 'blocked')

class Friend(models.Model):
	user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend1')
	user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend2')

	class Meta:
		unique_together = ('user1', 'user2')

class ChatRoom(models.Model):
	user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1')
	user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2')
	name = models.CharField(max_length=100)

class ChatMessage(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message')
	room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
	message = models.TextField()
	date = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ('date',)
