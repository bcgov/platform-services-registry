FROM node:22.10.0-alpine3.19

RUN apk update && \
    apk add --no-cache curl

WORKDIR /sandbox

COPY ./nats-provision ./nats-provision
COPY ./_packages ./_packages

RUN npm install -g turbo pnpm

RUN pnpm --dir _packages/keycloak-admin install --ignore-scripts
RUN pnpm --dir nats-provision install --ignore-scripts
RUN pnpm --dir nats-provision build

USER node
CMD ["node", "nats-provision/build/nats-provision/src/main.js"]
