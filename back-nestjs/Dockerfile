FROM node:19

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

RUN ./mkcert.sh

CMD ["npm", "run", "start:debug"]
