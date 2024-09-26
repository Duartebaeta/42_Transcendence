FROM python:3.10

WORKDIR /app

COPY user_game_stats/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY user_game_stats/srcs/ /app/

COPY shared /app/shared/

EXPOSE 8081

CMD ["python", "manage.py", "runserver", "127.0.0.1:8081"]
