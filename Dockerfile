FROM python:3.10

WORKDIR /app

COPY env/ env/

COPY requirements.txt .

COPY .env .

COPY shared/ shared/

RUN mkdir -p users/srcs/

RUN pip install -r env/requirements.txt

CMD ["python", "env/generator.py"]
