
FROM node:22.9.0-alpine3.19 as build

WORKDIR /sandbox

COPY ./keycloak-provision ./keycloak-provision
COPY ./_packages ./_packages
COPY ./m365proxy/mocks.json ./m365proxy/mocks.json

RUN npm install --ignore-scripts --prefix _packages/keycloak-admin
RUN npm install --ignore-scripts --prefix keycloak-provision
RUN npm run build --prefix keycloak-provision

USER node
CMD ["node", "keycloak-provision/build/keycloak-provision/src/main.js"]
