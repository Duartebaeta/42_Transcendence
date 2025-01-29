"""
ASGI config for livechat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

django_asgi_application = get_asgi_application()

from chatapp import routing
from livechat import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'livechat.settings')

application = ProtocolTypeRouter({
  "http": django_asgi_application,
  "websocket": AuthMiddlewareStack(
    URLRouter(
      routing.websocket_urlpatterns
    )
  ),
})
