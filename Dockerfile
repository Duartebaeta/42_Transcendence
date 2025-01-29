FROM python:3.10

WORKDIR /app

COPY env/ env/

COPY requirements.txt .

COPY .env .

COPY shared/ shared/

RUN mkdir -p users/srcs/ && touch users/srcs/.env

RUN mkdir -p user-game-stats/srcs/ && touch user-game-stats/srcs/.env

RUN mkdir -p livechat/srcs/ && touch livechat/srcs/.env

RUN mkdir -p gamebackend/srcs/ && touch gamebackend/srcs/.env

RUN mkdir -p nginx/frontend/ && touch nginx/frontend/.env

RUN pip install -r env/requirements.txt

CMD ["python", "env/generator.py"]
