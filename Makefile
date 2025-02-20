-include ./env/.env

COMPOSE := docker compose --env-file ./env/.env
LOCAL_LOG_DIR := back-nestjs/logs

all: build

# re-build only image with an update in the build context (i.e. a file changed)
build: $(LOCAL_LOG_DIR)
	@$(COMPOSE) build 

# re-build images from scratch
build_debug: $(LOCAL_LOG_DIR)
	@$(COMPOSE) build --no-cache --pull

run: $(LOCAL_LOG_DIR)
	@$(COMPOSE) up --build

$(LOCAL_LOG_DIR):
	@mkdir -p $@

restart: down run

re: down build run

re_debug: clean build_debug run

down:
	@$(COMPOSE) down

clean:
	@$(COMPOSE) down --remove-orphans --volumes --rmi all

.PHONY: all build build_debug run restart re re_debug down clean