FROM node:22.12.0-alpine3.19

RUN apk update && \
    apk add --no-cache curl

WORKDIR /sandbox

COPY ./nats-provision ./nats-provision
COPY ./_packages ./_packages

RUN npm install --ignore-scripts --prefix _packages/keycloak-admin
RUN npm install --ignore-scripts --prefix nats-provision
RUN npm run build --prefix nats-provision

USER node
CMD ["node", "nats-provision/build/nats-provision/src/main.js"]
