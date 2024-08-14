import os
from rsa_keys import generate_rsa_keys
from dotenv import load_dotenv, dotenv_values

USERS_ENV = 'users/srcs/.env'

load_dotenv('.env')

files = [
    USERS_ENV,
]

for env in files:
    try:
        os.remove(env)
    except FileNotFoundError:
        continue

def write_env_variable(key, value, file):
    if value is None:
        print(f'[ERROR] The key {key} is missing or doesn\'t have a value in .env file')
    fd = os.open(file, 'a')
    variable = f'{key}={value}'
    os.write(fd, variable.encode())


generate_rsa_keys()
os.rename('public_key.pem', 'env/public_key.pem')

# User Management
os.rename('private_key.pem', 'users/srcs/private_key.pem')
write_env_variable('DEGUB', os.getenv('DEBUG'), USERS_ENV)
write_env_variable('SECRET_REFRESH_KEY', os.urandom(32).hex(), USERS_ENV)
