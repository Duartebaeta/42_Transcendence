import jwt

from datetime import datetime, timedelta

from typing import Tuple, Union, List, Dict

class JWTManager:
	def __init__(self, algorithm: str, private_key: str, public_key: str, expiration_time: int):
		self.algorithm = algorithm
		self.private_key = private_key
		self.public_key = public_key
		self.expiration_time = expiration_time

	def encode_token(self, data: dict) -> Tuple[bool, Union[List[str], None], Union[str, None]]:
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
	
	def decode_token(self, token: str) -> Tuple[bool, Union[List[str], None], Union[Dict, None]]:
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