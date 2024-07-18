FROM node:22.5.0-alpine3.19 AS builder
WORKDIR /context

COPY m365mock/package.json m365mock/package-lock.json m365mock/tsconfig.json ./
COPY m365mock/src ./src
COPY m365proxy/mocks.json ./m365proxy/mocks.json

RUN npm install && npm run build

FROM node:22.5.0-alpine3.19
WORKDIR /context

COPY --from=builder /context/build ./build
COPY --from=builder /context/package.json /context/package-lock.json ./
COPY --from=builder /context/m365proxy/mocks.json ./m365proxy/mocks.json

RUN npm install --only=production

USER node
EXPOSE 4040

CMD ["node", "build/server.js"]
