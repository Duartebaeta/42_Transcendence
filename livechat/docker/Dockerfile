FROM python:3.10

WORKDIR /app

COPY livechat/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY livechat/srcs/ /app/

ENV DJANGO_SETTINGS_MODULE=livechat.settings
# COPY shared /app/shared/

EXPOSE 9000

CMD ["daphne", "-b", "0.0.0.0", "-p", "9000", "livechat.asgi:application"]
