FROM node:19

ARG PORT

EXPOSE $PORT

WORKDIR /app

COPY package*.json ./

RUN npm i

RUN npm i -g @nestjs/cli

RUN npm install @nestjs/platform-socket.io # Add this line

COPY . .

CMD ["npm", "run", "start:debug"]
