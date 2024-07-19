all:
	docker-compose up --build

down:
	@docker-compose -f docker-compose.yml down

clean:
	@docker-compose down --remove-orphans
	@docker-compose down --rmi all
	@docker-compose down -v

fclean: clean
	@docker volume prune -f
	@docker network prune -f
	@echo "Cleanup completed."

check:
	npx depcheck

.PHONY: all down clean fclean check