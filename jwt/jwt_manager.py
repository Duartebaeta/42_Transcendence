import jwt
import os

from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv('env/.env')

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
			return False, None, [str(e)]
		return True, token, None

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
			return False, None, [str(e)]
		return True, decoded, None


class AccessJWTManager:
	Manager = JWTManager(
		'RS256',
		None,
		os.getenv('ACCESS_PUBLIC_KEY'),# Public key from settings
		None,
	)

	@staticmethod
	def authenticate(token):
		valid, payload, errors = AccessJWTManager.Manager.decode_token(token)
		if not valid:
			return False, None, errors

		user_id = payload.get('user_id')
		if user_id is None or user_id == '':
			return False, None, ['No user_id inside the payload :((']

		return True, payload, None
