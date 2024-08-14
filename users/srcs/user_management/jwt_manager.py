import json

from django.conf import settings
from jwt.jwt_manager import JWTManager, AccessJWTManager

from user.models import User


class RefreshJWTManager:
	Manager = JWTManager(
		'HS256',
		settings.REFRESH_KEY,
		settings.REFRESH_KEY,

	)
