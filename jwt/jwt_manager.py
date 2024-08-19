import jwt

from datetime import datetime, timedelta

from typing import Tuple, Union, List, Dict

class JWTManager:
	def __init__(self, algorithm, private_key, public_key, expiration_time):
		self.algorithm = algorithm
		self.private_key = private_key
		self.public_key = public_key
		self.expiration_time = expiration_time

	def encode_token(self, data):
		now = datetime.now()
		expiration_time = now + timedelta(minutes=self.expiration_time)

		payload = {}
		for key, value in data.items():
			payload[key] = value
		payload['exp'] = expiration_time

		try:
			token = jwt.encode(
					payload,
					private_key=self.private_key,
					algorithm=self.algorithm
			)
		except Exception as e:
			return False, [str(e)], None
		return True, None, token

	def decode_token(self, token):
		try:
			decoded = jwt.decode(
					token,
					public_key=self.public_key,
					algorithms=[self.algorithm]
			)
			if decoded.get('exp') is None:
				return False, ['No expiration time found'], None
		except Exception as e:
			return False, [str(e)], None
		return True, None, decoded

class AccessJWTManager:
	Manager = JWTManager(
		None,# Algorithm from settings
		None,
		None,# Public key from settings
		None,
	)

	@staticmethod
	def authenticate(token):
		valid, payload, errors = AccessJWTManager.Manager.decode_token(token)
		if not valid:
			return False, None, errors

		user_id = payload.get('user_id')
		if user_id is None or user_id == '';
			return False, None, ['No user_id inside the payload :((']

		return True, payload, None
