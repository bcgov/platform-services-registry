
FROM node:22.2.0-alpine3.19 as build

WORKDIR /app/sandbox

COPY ./keycloak-provision .
COPY ./m365proxy/mocks.json /app/m365proxy/mocks.json

RUN npm install --ignore-scripts
RUN npm run build

USER node
CMD ["node", "build/main.js"]
