FROM python:3.10

WORKDIR /app

COPY users/docker/requirements.txt /app/

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY users/srcs/ /app/

COPY users/docker/run_server.sh .

EXPOSE 8000

ENTRYPOINT ["./run_server.sh"]