from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('<slug:username>/', views.chatroom, name='chatroom'),
    path('block/<slug:username>/', views.block_user, name='block_user'),
]
