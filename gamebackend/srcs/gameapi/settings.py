# settings.py
import os

from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

SECRET_KEY = os.getenv('GAME_SECRET_KEY')

DEBUG=True

INSTALLED_APPS = [
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'corsheaders',
	'channels',  # Add channels here
	'gameapi',   # Your app
	'cli_api',
]

MIDDLEWARE = [
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'corsheaders.middleware.CorsMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
	'django.middleware.common.CommonMiddleware',
]

# ASGI application
ASGI_APPLICATION = 'gameapi.asgi.application'

# Channels layers
# CHANNEL_LAYERS = {
# 	'default': {
# 		'BACKEND': 'channels_redis.core.RedisChannelLayer',
# 		'CONFIG': {
# 			"hosts": [('127.0.0.1', 6379)],
# 		},
# 	},
# }
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# URL configuration
ROOT_URLCONF = 'gameapi.urls'

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
	'http://172.20.10.3:5500',
]

# Session settings
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

import os
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
        },
    },
}