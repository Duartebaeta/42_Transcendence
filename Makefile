SERVICES ?= frontend gamebackend livechat user_game_stats users

setup:
	@python env/generator.py
	@for service in $(SERVICES); do \
		cp -r shared $$service/srcs; \
	done

up:
	docker-compose up -d

down:
	docker-compose down

test-%:
	docker-compose run $* sh

clear-containers:
	docker rm -vf $$(docker ps -aq)
