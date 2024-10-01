SERVICES ?= frontend gamebackend livechat user_game_stats users
DJANGO_SERVICES ?= livechat user_game_stats users

flush:
	for service in $(DJANGO_SERVICES); do \
		cd $$service/srcs && \
		echo "yes" | python manage.py flush && \
		cd -; \
	done

setup:
	@docker build -t python-env .
	@docker run --rm -v $$(pwd)/shared:/app/shared python-env
	@for service in $(SERVICES); do \
		cp -r shared $$service/srcs; \
	done
	@echo "Setup completed"

up:
	docker compose build --no-cache
	docker compose up

down:
	docker compose down

test-%:
	docker compose run $* sh

docker-flush:
	for service in $(DJANGO_SERVICES); do \
		docker compose exec $$service bash -c 'echo "yes" | python manage.py flush'; \
	done

docker-migrate:
	for service in $(DJANGO_SERVICES); do \
		docker compose exec $$service python manage.py makemigrations; \
		docker compose exec $$service python manage.py migrate; \
	done

docker-createsuperuser-%:
	docker compose exec $* python manage.py createsuperuser

clear-containers:
	docker rm -vf $$(docker ps -aq)
