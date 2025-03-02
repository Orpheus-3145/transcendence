-include ./env/.env

ENV_PATH := ./env/.env
COMPOSE := $(shell command -v docker-compose 2>/dev/null || echo "docker compose") --env-file $(ENV_PATH)
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
	@$(COMPOSE) down --remove-orphans --volumes --rmi local

.PHONY: all build build_debug run restart re re_debug down clean