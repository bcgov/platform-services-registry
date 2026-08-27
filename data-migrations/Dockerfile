FROM node:24.19.0-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY data-migrations/package.json ./data-migrations/package.json
COPY data-migrations/migrate-mongo-config.js ./data-migrations/migrate-mongo-config.js
COPY data-migrations/migrations ./data-migrations/migrations


RUN npm install -g turbo pnpm@11.24.0
RUN pnpm install --frozen-lockfile --ignore-scripts

WORKDIR /app/data-migrations

USER node

CMD ["node_modules/.bin/migrate-mongo", "up"]
