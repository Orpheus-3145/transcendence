COMPOSE := docker compose --progress=auto --env-file ./env/.env

all: build

# re-build only image with an update in the build context (i.e. a file changed)
build:
	@$(COMPOSE) build 

run:
	@$(COMPOSE) up --no-build

re: down run

# re-build images from scratch
build_debug:
	@$(COMPOSE) build --no-cache --pull

run_debug:
	@$(COMPOSE) up --build

re_debug: clean run

down:
	@$(COMPOSE) down

clean:
	@$(COMPOSE) down --remove-orphans --volumes --rmi all

.PHONY: all build run re build_debug run_debug re_debug down clean