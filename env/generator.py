import os
from dotenv import load_dotenv, dotenv_values

USERS_ENV = 'users/srcs/.env'
USERS = 'users/.env'

load_dotenv('.env')

files = [
    USERS_ENV,
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
    fd = os.open(file, os.O_APPEND)
    variable = f'{key}={value}'
    os.write(fd, variable.encode())
