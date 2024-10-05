FROM python:3.10

WORKDIR /app

COPY user-game-stats/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY user-game-stats/srcs/ /app/

COPY shared /app/shared/

EXPOSE 8080

CMD ["python", "manage.py", "runserver", "8080"]
