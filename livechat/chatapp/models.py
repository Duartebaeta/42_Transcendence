from django.db import models
from django.contrib.auth.models import User

# Create your models here.
# class ChatUser(models.Model):
#   user = models.OneToOneField(User, on_delete=models.CASCADE)
#   blocked_users = models.ManyToManyField(
#     User,
#     related_name='blocked_by',
#     blank=True
#   )

class ChatRoom(models.Model):
  name = models.CharField(max_length=100)
  slug = models.SlugField(unique=True)
  user1 = models.ForeignKey(User, on_delete=models.CASCADE, default=1, related_name='user1')
  user2 = models.ForeignKey(User, on_delete=models.CASCADE, default=2, related_name='user2')
  blocked = models.BooleanField(default=False)

class Blocked(models.Model):
  blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocker')
  blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked')

class ChatMessage(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
  blocked = models.BooleanField(default=False)
  message = models.TextField()
  date = models.DateTimeField(auto_now=True)
  class Meta:
    ordering = ('date',)
