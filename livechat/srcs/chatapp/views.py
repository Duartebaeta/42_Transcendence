from django.shortcuts import render
from .models import ChatRoom, User, ChatMessage

# Create your views here.
def index(request):
  users = User.objects.exclude(id=request.user.id)
  return render(request, 'chatapp/index.html', {'users': users})

def chatroom(request, username):
	auth_username = request.user.username
	auth_user = User.objects.get(username=auth_username)
	user = User.objects.get(username=username)
	try:
		chatroom = ChatRoom.objects.get(user1=user, user2=auth_user)
	except ChatRoom.DoesNotExist:
		chatroom, created = ChatRoom.objects.get_or_create(
		    user1=auth_user, user2=user, name=f'{auth_username}-{username}', slug=f'{auth_username}-{username}')
		messages = ChatMessage.objects.filter(room=chatroom)[0:30]
	return render(request, 'chatapp/room.html', {'chatroom': chatroom, 'messages': messages})
