FROM node:22.2.0-alpine3.19

WORKDIR /sandbox

COPY ./m365mock/package.json ./package.json
COPY ./m365mock/package-lock.json ./package-lock.json
COPY ./m365mock/tsconfig.json ./tsconfig.json
COPY ./m365proxy/mocks.json ./m365proxy/mocks.json
COPY ./m365mock/src ./src

RUN npm install

RUN npm run build

USER node

EXPOSE 4040

CMD ["node", "dist/server.js"]
