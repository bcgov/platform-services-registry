FROM node:20-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json", "migrate-mongo-config.js", "migrations", "./"]

RUN npm install

USER node

CMD ["node_modules/.bin/migrate-mongo", "up"]
