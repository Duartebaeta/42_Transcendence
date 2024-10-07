FROM python:3.10

WORKDIR /app

COPY users/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY users/srcs/ /app/

# COPY shared /app/shared/

EXPOSE 8000

CMD ["gunicorn", "user_management.wsgi:application", "--bind", "0.0.0.0:8000"]