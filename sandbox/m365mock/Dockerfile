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

COPY --from=build /opt/sandbox/m365mock/build ./sandbox/m365mock/build
COPY --from=build /opt/sandbox/m365mock/node_modules ./sandbox/m365mock/node_modules
COPY --from=build /opt/node_modules ./node_modules
COPY --from=build /opt/mock-users.json ./sandbox/m365mock/build/mock-users.json

USER node
EXPOSE 4040

CMD ["node", "sandbox/m365mock/build/m365mock/main.js"]
