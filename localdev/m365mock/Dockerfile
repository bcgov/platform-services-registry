FROM node:22.10.0-alpine3.19 AS builder
WORKDIR /context

COPY m365mock/package.json m365mock/pnpm-lock.yaml m365mock/tsconfig.json ./
COPY m365mock/src ./src
COPY m365proxy/mocks.json ./m365proxy/mocks.json

RUN npm install -g turbo pnpm
RUN pnpm install --ignore-scripts
RUN pnpm build

FROM node:22.10.0-alpine3.19
WORKDIR /context

COPY --from=builder /context/build ./build
COPY --from=builder /context/package.json /context/pnpm-lock.yaml ./
COPY --from=builder /context/m365proxy/mocks.json ./m365proxy/mocks.json

RUN npm install -g turbo pnpm
RUN pnpm install --ignore-scripts

USER node
EXPOSE 4040

CMD ["node", "build/server.js"]
