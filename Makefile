all: build

build:
	docker-compose build

build_debug:
	docker-compose build --no-cache

run:
	docker-compose up

run_debug:
	docker-compose up --build

down:
	@docker-compose -f docker-compose.yml down

clean:
	@docker-compose down --remove-orphans
	@docker-compose down --rmi all
	@docker-compose down -v

prune: clean
	@docker volume prune -f
	@docker network prune -f
	@echo "Cleanup completed."

check:
	npx depcheck

.PHONY: all build all debug down clean prune check