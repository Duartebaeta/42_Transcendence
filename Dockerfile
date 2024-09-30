FROM python:3.10

RUN mkdir /output

WORKDIR /app

COPY env/ env/

COPY requirements.txt .

COPY .env .

COPY shared/ shared/

RUN mkdir -p users/srcs/ && touch users/srcs/.env

RUN pip install -r requirements.txt

RUN python env/generator.py

CMD ["mv", "-t", "shared", "public_key.pem", "private_key.pem"]

# CMD ["python", "env/generator.py"]