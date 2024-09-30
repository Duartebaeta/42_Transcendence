import os

from dotenv import load_dotenv

load_dotenv('shared/.env')

ACCESS_PUBLIC_KEY=open('shared/public_key.pem').read()
USERNAME_MAX_LENGTH = 20
DEBUG=os.getenv('DEBUG')
