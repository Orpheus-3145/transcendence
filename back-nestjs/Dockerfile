FROM node:19

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

CMD ["npm", "run", "start:debug"]
