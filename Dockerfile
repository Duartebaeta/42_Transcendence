FROM python:3.10

WORKDIR /app

COPY env/ env/

COPY requirements.txt .

COPY .env .

COPY shared/ shared/

RUN mkdir -p users/srcs/ && touch users/srcs/.env

RUN mkdir -p user_game_stats/srcs/ && touch user_game_stats/srcs/.env

RUN mkdir -p livechat/srcs/ && touch livechat/srcs/.env

RUN mkdir -p gamebackend/srcs/ && touch gamebackend/srcs/.env

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

RUN pip install -r env/requirements.txt

CMD ["python", "env/generator.py"]
