#!/bin/bash

python /app/manage.py makemigrations
python /app/manage.py migrate

daphne -b 0.0.0.0 -p 9000 livechat.asgi:application
