#!/bin/bash

python /app/manage.py makemigrations
python /app/manage.py migrate

gunicorn user_management.wsgi:application --bind 0.0.0.0:8000
