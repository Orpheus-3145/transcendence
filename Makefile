all:
	docker-compose up --build

down:
	@docker-compose -f docker-compose.yml down

clean fclean:
	docker stop $$(docker ps -qa) > /dev/null 2>&1; \
	docker rm $$(docker ps -qa) > /dev/null 2>&1; \
	docker rmi -f $$(docker images -qa) > /dev/null 2>&1; \
	docker volume rm $$(docker volume ls -q) > /dev/null 2>&1; \
	docker network rm $$(docker network ls -q) > /dev/null 2>&1; \

check:
	npx depcheck

.PHONY: all down clean fclean