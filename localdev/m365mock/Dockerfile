FROM alpine:latest as preparer
WORKDIR /context
COPY m365proxy/mocks.json ./mocks.json

FROM node:22.2.0-alpine3.19
WORKDIR /sandbox

COPY m365mock/package.json m365mock/package-lock.json m365mock/tsconfig.json ./
COPY m365mock/src ./src

COPY --from=preparer /context/mocks.json ./m365proxy/mocks.json

RUN npm install
RUN npm run build

RUN mkdir -p ./dist/m365proxy && cp ./m365proxy/mocks.json ./dist/m365proxy/mocks.json

USER node

EXPOSE 4040

CMD ["node", "dist/server.js"]
