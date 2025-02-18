import os
from rsa_keys import generate_rsa_keys
from dotenv import load_dotenv, dotenv_values

USERS_ENV = 'users/srcs/.env'
STATS_ENV = 'user-game-stats/srcs/.env'
CHAT_ENV = 'livechat/srcs/.env'
GAME_ENV = 'gamebackend/srcs/.env'
SHARED_ENV = 'shared/.env'

load_dotenv('.env')

files = [
	USERS_ENV,
	STATS_ENV,
	CHAT_ENV,
	GAME_ENV,
	SHARED_ENV,
]

for env in files:
	try:
		os.remove(env)
	except FileNotFoundError:
		continue

def write_env_variable(key, value, file):
	if value is None:
		print(f'[ERROR] The key {key} is missing or doesn\'t have a value in .env file')
	fd = open(file, 'a')
	variable = f'{key}={value}\n'
	fd.write(variable)


generate_rsa_keys()
os.rename('public_key.pem', 'shared/public_key.pem')
os.rename('private_key.pem', 'shared/private_key.pem')

# Shared
write_env_variable('DEGUB', os.getenv('DEBUG'), SHARED_ENV)

# User Management
write_env_variable('API_URL', os.getenv('API_URL'), USERS_ENV)
write_env_variable('USER_SECRET_KEY', os.urandom(32).hex(), USERS_ENV)
write_env_variable('SECRET_REFRESH_KEY', os.urandom(32).hex(), USERS_ENV)
write_env_variable('EMAIL_HOST', os.getenv('EMAIL_HOST'), USERS_ENV)
write_env_variable('EMAIL_PORT', os.getenv('EMAIL_PORT'), USERS_ENV)
write_env_variable('EMAIL_HOST_USER', os.getenv('EMAIL_HOST_USER'), USERS_ENV)
write_env_variable('EMAIL_HOST_PASSWORD', os.getenv('EMAIL_HOST_PASSWORD'), USERS_ENV)
write_env_variable('DEFAULT_FROM_EMAIL', os.getenv('DEFAULT_FROM_EMAIL'), USERS_ENV)
write_env_variable('EMAIL_USE_TLS', os.getenv('EMAIL_USE_TLS'), USERS_ENV)

# User Stats
write_env_variable('API_URL', os.getenv('API_URL'), STATS_ENV)
write_env_variable('STATS_SECRET_KEY', os.urandom(32).hex(), STATS_ENV)

# Live Chat
write_env_variable('API_URL', os.getenv('API_URL'), CHAT_ENV)
write_env_variable('CHAT_SECRET_KEY', os.urandom(32).hex(), CHAT_ENV)

# Gamebackend
write_env_variable('API_URL', os.getenv('API_URL'), GAME_ENV)
write_env_variable('GAME_SECRET_KEY', os.urandom(32).hex(), GAME_ENV)