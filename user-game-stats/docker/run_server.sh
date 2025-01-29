#!/bin/bash

python /app/manage.py makemigrations user_stats
python /app/manage.py makemigrations
python /app/manage.py migrate

gunicorn user_game_stats.wsgi:application --bind 0.0.0.0:8080
