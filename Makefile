COMPOSE := docker compose --env-file ./env/.env

all: build

# re-build only image with an update in the build context (i.e. a file changed)
build:
	@mkdir -p back-nestjs/logs
	@$(COMPOSE) build 

# re-build images from scratch
build_debug:
	@$(COMPOSE) build --no-cache --pull

run:
	@$(COMPOSE) up --no-build

restart: down run

re: down build run

re_debug: clean build_debug run

down:
	@$(COMPOSE) down

clean:
	@$(COMPOSE) down --remove-orphans --volumes --rmi all

.PHONY: all build build_debug run restart re re_debug down clean