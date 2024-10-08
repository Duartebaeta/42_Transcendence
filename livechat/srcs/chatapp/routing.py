from django.urls import path

from chatapp import consumers

websocket_urlpatterns = [
  path('ws/chat/<str:room_name>/', consumers.ChatConsumer.as_asgi()),
  path('ws/chat/<str:user_id>/<str:username>/', consumers.LoginChecker.as_asgi()),
]
