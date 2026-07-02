FROM node:24.18.0-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./data-migrations/migrate-mongo-config.js ./
COPY data-migrations/migrations ./migrations

RUN npm install -g turbo pnpm
RUN pnpm install --frozen-lockfile --ignore-scripts

USER node

CMD ["node_modules/.bin/migrate-mongo", "up"]
