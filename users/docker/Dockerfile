FROM python:3.10

WORKDIR /app

COPY users/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY users/srcs/ /app/

COPY shared /app/shared/

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "127.0.0.1:8000"]
