FROM python:3.9

WORKDIR /app

COPY docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY /srcs/ /app/

EXPOSE 9000

CMD ["python", "manage.py", "runserver", "127.0.0.1:9000"]
