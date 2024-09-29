SERVICES ?= frontend gamebackend livechat user_game_stats users
DJANGO_SERVICES ?= livechat user_game_stats users

flush:
	for service in $(DJANGO_SERVICES); do \
		cd $$service/srcs && \
		echo "yes" | python manage.py flush && \
		cd -; \
	done

setup:
	# @python env/generator.py
	@for service in $(SERVICES); do \
		cp -r shared $$service/srcs; \
	done

up:
	docker compose build --no-cache
	docker compose up

down:
	docker compose down

test-%:
	docker compose run $* sh

clear-containers:
	docker rm -vf $$(docker ps -aq)
