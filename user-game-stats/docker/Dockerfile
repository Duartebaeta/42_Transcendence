FROM python:3.10

WORKDIR /app

COPY user-game-stats/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY user-game-stats/srcs/ /app/

COPY user-game-stats/docker/run_server.sh .

EXPOSE 8080

ENTRYPOINT ["./run_server.sh"]
