FROM node:22.10.0-alpine3.19 AS build
WORKDIR /opt

COPY ["mock-users.json", "types.ts", "./"]
COPY m365mock ./app

RUN npm install -g turbo pnpm
RUN cd app && pnpm install --ignore-scripts
RUN cd app && pnpm build

FROM node:22.10.0-alpine3.19
WORKDIR /opt

COPY --from=build /opt/app/package.json ./app/package.json
COPY --from=build /opt/app/pnpm-lock.yaml ./app/pnpm-lock.yaml
COPY --from=build /opt/app/node_modules ./app/node_modules
COPY --from=build /opt/app/build/app ./app/build
COPY --from=build /opt/mock-users.json ./app/mock-users.json

USER node
EXPOSE 4040

CMD ["node", "app/build/server.js"]
