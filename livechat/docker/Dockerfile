FROM python:3.10

WORKDIR /app

COPY livechat/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY livechat/srcs/ /app/

ENV DJANGO_SETTINGS_MODULE=livechat.settings

COPY livechat/docker/run_server.sh .

EXPOSE 9000

ENTRYPOINT ["./run_server.sh"]