FROM node:19

WORKDIR /app

COPY . .

RUN chmod 744 mkcert.sh

RUN ./mkcert.sh

RUN npm install

CMD ["npm", "run", "dev"]
