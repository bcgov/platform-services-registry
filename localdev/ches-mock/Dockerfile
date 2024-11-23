FROM node:22.10.0-alpine3.19 AS builder
WORKDIR /context

COPY ches-mock/package.json ches-mock/package-lock.json ches-mock/tsconfig.json ./
COPY ches-mock/src ./src

RUN npm install && npm run build

FROM node:22.10.0-alpine3.19
WORKDIR /context

COPY --from=builder /context/build ./build
COPY --from=builder /context/package.json /context/package-lock.json ./

RUN npm install --only=production

USER node
EXPOSE 3100

CMD ["node", "build/main.js"]
