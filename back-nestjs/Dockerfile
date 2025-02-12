FROM node:19

WORKDIR /app

COPY . .

RUN npm install

RUN mkdir logs

CMD ["npm", "run", "start:debug"]
