FROM node:lts

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install && npm run build

CMD ["npm", "run", "start:dev"]