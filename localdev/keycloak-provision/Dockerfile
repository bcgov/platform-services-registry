FROM node:22.12.0-alpine3.19 AS build
WORKDIR /opt

COPY ["mock-users.json", "types.ts", "./"]
COPY keycloak-provision ./context
COPY _packages ./_packages

RUN npm install -g turbo pnpm
RUN cd context && pnpm install --ignore-scripts && pnpm build

FROM node:22.12.0-alpine3.19
WORKDIR /opt

COPY --from=build /opt/context/build ./
COPY --from=build /opt/mock-users.json ./mock-users.json
COPY --from=build /opt/context/node_modules ./node_modules

USER node

CMD ["node", "context/main.js"]
