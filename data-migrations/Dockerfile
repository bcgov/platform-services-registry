FROM node:22.4.0-alpine3.19

WORKDIR /app

COPY ["package.json", "package-lock.json", "migrate-mongo-config.js", "./"]
COPY migrations migrations

RUN npm install --ignore-scripts

USER node

CMD ["node_modules/.bin/migrate-mongo", "up"]
