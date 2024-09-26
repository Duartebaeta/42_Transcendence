FROM python:3.10

WORKDIR /app

COPY livechat/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY livechat/srcs/ /app/

COPY shared /app/shared/

EXPOSE 9000

CMD ["python", "manage.py", "runserver", "127.0.0.1:9000"]
