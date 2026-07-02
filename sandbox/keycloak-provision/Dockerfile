FROM node:24.18.0-alpine AS build
WORKDIR /opt

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sandbox/mock-users.json ./
COPY sandbox/types.ts ./sandbox/types.ts
COPY sandbox/keycloak-provision ./sandbox/keycloak-provision
COPY sandbox/_packages ./sandbox/_packages

RUN npm install -g turbo pnpm
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --dir sandbox/_packages/keycloak-admin build
RUN pnpm --dir sandbox/keycloak-provision build

FROM node:24.18.0-alpine
WORKDIR /opt

COPY --from=build /opt/sandbox/keycloak-provision/build ./
COPY --from=build /opt/mock-users.json ./mock-users.json
COPY --from=build /opt/sandbox/keycloak-provision/node_modules ./node_modules


USER node

CMD ["node", "context/main.js"]
