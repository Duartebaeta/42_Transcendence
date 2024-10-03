SERVICES ?= frontend gamebackend livechat user-game-stats users
DJANGO_SERVICES ?= livechat user-game-stats users

flush:
	for service in $(DJANGO_SERVICES); do \
		cd $$service/srcs && \
		echo "yes" | python manage.py flush && \
		cd -; \
	done

setup:
	@docker build -t python-env .
	@docker run --name python-env python-env
	@docker cp python-env:/app/users/srcs/.env $$(pwd)/users/srcs/.env
	@docker cp python-env:/app/shared $$(pwd)
	@for service in $(DJANGO_SERVICES); do \
		cp -r shared $$service/srcs; \
	done
	@docker rm python-env
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
	docker compose exec user-game-stats python manage.py makemigrations user_stats
	docker compose exec user-game-stats python manage.py migrate user_stats

docker-createsuperuser-%:
	docker compose exec $* python manage.py createsuperuser

clear-containers:
	docker rm -vf $$(docker ps -aq)

create-new-db-files:
	for service in $(DJANGO_SERVICES); do \
		rm -rf $$service/srcs/db.sqlite3; \
		touch $$service/srcs/db.sqlite3; \
	done
