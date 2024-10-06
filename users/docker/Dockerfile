FROM python:3.10

WORKDIR /app

COPY docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY srcs/ /app/

EXPOSE 8000

CMD ["gunicorn", "user_management.wsgi:application", "--bind", "0.0.0.0:8000"]
# CMD ["python", "srcs/manage.py", "runserver", "0.0.0.0:8000"]
