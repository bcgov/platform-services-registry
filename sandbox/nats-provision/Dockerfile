FROM node:24.18.0-alpine AS build
WORKDIR /opt

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sandbox/mock-users.json ./
COPY sandbox/types.ts ./sandbox/types.ts
COPY sandbox/nats-provision ./sandbox/nats-provision
COPY sandbox/_packages ./sandbox/_packages

RUN npm install -g turbo pnpm
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --dir sandbox/_packages/keycloak-admin build
RUN pnpm --dir sandbox/nats-provision build

FROM node:24.18.0-alpine
WORKDIR /opt

COPY --from=build /opt/sandbox/nats-provision/build ./sandbox/nats-provision/build
COPY --from=build /opt/sandbox/nats-provision/node_modules ./sandbox/nats-provision/node_modules
COPY --from=build /opt/node_modules ./node_modules
COPY --from=build /opt/mock-users.json ./sandbox/nats-provision/build/mock-users.json

USER node

CMD ["node", "sandbox/nats-provision/build/nats-provision/main.js"]
