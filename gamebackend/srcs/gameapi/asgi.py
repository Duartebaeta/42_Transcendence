# asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

django_asgi_application = get_asgi_application()

from gameapi import routing
from gameapi import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gameapi.settings')

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter(
			routing.websocket_urlpatterns
		)
	),
})