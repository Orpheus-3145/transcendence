all: build

# re-build only image with an update in the build context (i.e. a file changed)
build:
	@docker compose build

run:
	@docker compose up

re: down run

# re-build images from scratch
build_debug:
	@docker compose build --no-cache --pull

run_debug:
	@docker compose up --build

re_debug: clean run

down:
	@docker compose down

clean:
	@docker compose down --remove-orphans --volumes --rmi all

check:
	npx depcheck

.PHONY: all build all debug down clean prune check