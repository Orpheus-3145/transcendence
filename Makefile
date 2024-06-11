init:
	cd ./src/front-react && npm install react-router-dom @types/react-router-dom
	cd ./src/backend-nestjs && npm install @nestjs/typeorm typeorm pg @nestjs/config

build:
	docker-compose build

up:
	docker-compose up

down:
	docker-compose down

dbclean: down
	docker volume prune -f

clean: dbclean
	rm -rf ## NEED TO SET FIRST ##

fclean: clean
	docker system prune -af

.PHONY: build up down dblean clean fclean