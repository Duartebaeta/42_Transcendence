import json

from django.conf import settings
from shared.jwt_manager import JWTManager, AccessJWTManager

from user.models import User


def valid_user_id(user_id):
	if (user_id is None or
			user_id == '' or
			type(user_id) is not int or
			user_id < 0):
		return False
	return User.objects.filter(id=user_id).exists()

class RefreshJWTManager:
	Manager = JWTManager(
		'HS256',
		settings.REFRESH_KEY,
		settings.REFRESH_KEY,
		settings.REFRESH_KEY_EXPIRATION_TIME
	)

	@staticmethod
	def generate_token(user_id):
		if not valid_user_id(user_id):
			return False, None, ['Invalid user_id']
		return RefreshJWTManager.Manager.encode_token({'user_id': user_id, 'token_type': 'refresh'})


	@staticmethod
	def authenticate(jwt_token):
		is_valid, payload, errors = RefreshJWTManager.Manager.decode_token(jwt_token)

		if not is_valid:
			return False, None, errors

		user_id = payload.get('user_id')
		if user_id is None or user_id == '':
			return False, None, ['No user_id in the payload, nada :(']
		if not valid_user_id(user_id):
			return False, None, ['Invalid user_id']
		return True, user_id, None

class UserAccessJWTManager:
	Manager = JWTManager(
		'RS256',
		settings.PRIVATE_ACCESS_KEY,
		None,
		settings.ACCESS_KEY_EXPIRATION_TIME
	)

	@staticmethod
	def generate_token(user_id):
		if not valid_user_id(user_id):
			return False, None, ['Invalid user_id, big no no']
		return UserAccessJWTManager.Manager.encode_token({'user_id': user_id, 'token_type': 'access'})

	@staticmethod
	def authenticate(jwt_token):
		is_valid , payload, errors = AccessJWTManager.authenticate(jwt_token)

		if not is_valid:
			return False, None, errors
		user_id = payload.get('user_id')
		if user_id is None or user_id == '':
			return False, None, ['We searched the payload and no user_id was found wtff']
		if not valid_user_id(user_id):
			return False, None, ['Invalid user_id']
		return True, user_id, None
