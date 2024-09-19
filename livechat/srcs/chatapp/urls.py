from django.urls import path

from chatapp.views.user import User
from chatapp.views.block import BlockUser

urlpatterns = [
    path('user/', User.as_view(), name='user'),
	path('match/',BlockUser.as_view(), name='block'),
    path('<slug:username>/', views.chatroom, name='chatroom'),
]
