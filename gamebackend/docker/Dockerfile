FROM python:3.10

WORKDIR /app

COPY gamebackend/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY gamebackend/srcs/ /app/

COPY shared /app/shared/

ENV DJANGO_SETTINGS_MODULE=gameapi.settings

EXPOSE 9090

# CMD ["tail", "-f"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "9090", "gameapi.asgi:application"]
