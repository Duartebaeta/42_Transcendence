from django.db import models
# from django.contrib.auth.models import User
from shared import settings as shared_settings

# Create your models here.

class User(models.Model):
	id = models.IntegerField(primary_key=True)
	username = models.CharField(unique=True, max_length=shared_settings.USERNAME_MAX_LENGTH)


# class ChatUser(models.Model):
#   user = models.OneToOneField(User, on_delete=models.CASCADE)
#   blocked_users = models.ManyToManyField(
#     User,
#     related_name='blocked_by',
#     blank=True
#   )

class ChatRoom(models.Model):
  user1 = models.ForeignKey(User, on_delete=models.CASCADE, default=1, related_name='user1')
  user2 = models.ForeignKey(User, on_delete=models.CASCADE, default=2, related_name='user2')
  name = models.CharField(max_length=100)
  slug = models.SlugField(unique=True)

class ChatMessage(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
  message = models.TextField()
  date = models.DateTimeField(auto_now=True)
  class Meta:
    ordering = ('date',)
