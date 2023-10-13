FROM node:16-alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm config set cache /app/.npm-cache --global

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
