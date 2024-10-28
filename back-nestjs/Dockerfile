FROM node:19

ARG PORT

EXPOSE $PORT

WORKDIR /app

COPY package*.json ./

RUN npm i

RUN npm i -g @nestjs/cli

COPY . .

# RUN mkdir -p /app/ssl

CMD ["npm", "run", "start:debug"]
