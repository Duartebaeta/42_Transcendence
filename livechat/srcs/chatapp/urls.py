from django.urls import path

from chatapp.views.user import User
from chatapp.views.block import BlockUser
from chatapp.views.friend import FriendView
from chatapp.views.chatroom import ChatRoomView
from chatapp.views.message import MessageView
from chatapp.views.invite import Invite
from chatapp.views.notification import Notification

urlpatterns = [
	path('invite/', Invite.as_view(), name='invite'),
    path('user/', User.as_view(), name='user'),
    path('chatroom/', ChatRoomView.as_view(), name='chatroom'),
    path('message/', MessageView.as_view(), name='message'),
	path('block/',BlockUser.as_view(), name='block'),
	path('friend/',FriendView.as_view(), name='friend'),
    path('notification/', Notification.as_view(), name='notification'),
]
