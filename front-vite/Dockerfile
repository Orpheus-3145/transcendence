FROM node:19

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ./mkcert.sh

CMD ["npm", "run", "dev"]
