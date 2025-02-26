-include ./env/.env

COMPOSE := docker compose --env-file ./env/.env
LOCAL_LOG_DIR := back-nestjs/logs

all: build

# re-build only image with an update in the build context (i.e. a file changed)
build: $(LOCAL_LOG_DIR)
	@$(COMPOSE) up --build

# re-build images from scratch
build_debug: $(LOCAL_LOG_DIR)
	@$(COMPOSE) build --no-cache --pull

# only run the containers
start: $(LOCAL_LOG_DIR)
	@$(COMPOSE) up

down:
	@$(COMPOSE) down

clean:
	@$(COMPOSE) down --remove-orphans --volumes --rmi all

restart: down start

re: down all

re_debug: clean build_debug start

$(LOCAL_LOG_DIR):
	@mkdir -p $@

.PHONY: all build build_debug start down clean restart re re_debug