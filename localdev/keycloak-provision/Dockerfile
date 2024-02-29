
FROM node:20-alpine

WORKDIR /app

COPY ./keycloak-provision .
COPY ./m365proxy/responses.json responses.json

RUN npm install --ignore-scripts

USER node

CMD ["node", "setup.js"]
