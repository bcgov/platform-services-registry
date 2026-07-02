FROM node:24.18.0-alpine AS build
WORKDIR /opt

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sandbox/mock-users.json ./
COPY sandbox/types.ts ./sandbox/types.ts
COPY sandbox/m365mock ./sandbox/m365mock


RUN npm install -g turbo pnpm
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --dir sandbox/m365mock build

FROM node:24.18.0-alpine
WORKDIR /opt

COPY --from=build /opt/sandbox/m365mock/build ./
COPY --from=build /opt/mock-users.json ./mock-users.json
COPY --from=build /opt/sandbox/m365mock/node_modules ./node_modules

USER node
EXPOSE 4040

CMD ["node", "context/main.js"]
