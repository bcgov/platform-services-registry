FROM node:22.12.0-alpine3.19

WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "migrate-mongo-config.js", "./"]
COPY migrations migrations

RUN npm install -g turbo pnpm
RUN pnpm install --frozen-lockfile --ignore-scripts

USER node

CMD ["node_modules/.bin/migrate-mongo", "up"]
