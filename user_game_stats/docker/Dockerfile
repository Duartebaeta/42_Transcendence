FROM python:3.10

WORKDIR /app

COPY user_game_stats/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY user_game_stats/srcs/ /app/

COPY shared /app/shared/

EXPOSE 8080

# RUN python manage.py makemigrations user_stats

# RUN python manage.py migrate

CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
