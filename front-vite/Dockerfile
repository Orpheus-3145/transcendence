FROM node:19

ARG PORT

EXPOSE $PORT

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY ssl /app/

CMD ["npm", "run", "dev"]
