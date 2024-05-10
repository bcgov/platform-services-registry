
FROM node:22.1.0-alpine3.19

WORKDIR /app

COPY ./keycloak-provision .
COPY ./m365proxy/mocks.json mocks.json

RUN npm install --ignore-scripts

USER node

CMD ["node", "setup.js"]
