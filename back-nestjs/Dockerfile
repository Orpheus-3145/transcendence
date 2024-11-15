FROM node:19

WORKDIR /app

COPY package*.json ./

COPY . .

RUN chmod 744 mkcert.sh

RUN ./mkcert.sh

RUN npm install

RUN npm i -g @nestjs/cli

RUN npm install @nestjs/platform-socket.io # Add this line

CMD ["npm", "run", "start:debug"]
