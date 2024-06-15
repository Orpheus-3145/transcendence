# react:
#	react-router-dom
#	mui - material, icons, @emotion/react, @emotion/styled
#	roboto - Default fount from google
#	tsparticles react-tsparticles
# nestjs:
#	@nestjs/typeorm
#	@nestjs/config

init:
	cd ./src/front-vite && npm install
	cd ./src/backend-nestjs && npm install

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