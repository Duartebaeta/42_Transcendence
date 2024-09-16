from django.contrib import admin
from django.urls import path, include
from chatapp.views.user import User

urlpatterns = [
    path('user/', User.as_view(), name='user'),
    path('<slug:username>/', views.chatroom, name='chatroom'),
]
