from django.urls import path

from chatapp.views.user import User
from chatapp.views.block import BlockUser
from chatapp.views.friend import FriendView

urlpatterns = [
    path('user/', User.as_view(), name='user'),
	path('block/',BlockUser.as_view(), name='block'),
	path('friend/',FriendView.as_view(), name='friend'),
    # path('<slug:username>/', views.chatroom, name='chatroom'),
]
