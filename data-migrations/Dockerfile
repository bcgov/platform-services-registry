# TODO: debug further why migrate-mongo package won't work with 22.12 and contribute the package if needed.
FROM node:22.10.0-alpine3.19

WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "migrate-mongo-config.js", "./"]
COPY migrations migrations

RUN npm install -g turbo pnpm
RUN pnpm install --ignore-scripts

USER node

CMD ["node_modules/.bin/migrate-mongo", "up"]
