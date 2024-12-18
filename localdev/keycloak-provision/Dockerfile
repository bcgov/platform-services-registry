
FROM node:22.10.0-alpine3.19 as build

WORKDIR /sandbox

COPY ./keycloak-provision ./keycloak-provision
COPY ./_packages ./_packages
COPY ./mock-users.json ./mock-users.json

RUN npm install -g turbo pnpm
RUN pnpm --dir _packages/keycloak-admin install --ignore-scripts
RUN pnpm --dir keycloak-provision install --ignore-scripts
RUN pnpm --dir keycloak-provision build

USER node
CMD ["node", "keycloak-provision/build/keycloak-provision/src/main.js"]
