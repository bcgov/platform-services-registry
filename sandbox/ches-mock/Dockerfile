FROM node:22.12.0-alpine3.19 AS build
WORKDIR /opt

COPY ches-mock ./context

RUN npm install -g turbo pnpm
RUN cd context && pnpm install --frozen-lockfile --ignore-scripts && pnpm build

FROM node:22.12.0-alpine3.19
WORKDIR /opt

COPY --from=build /opt/context/build ./
COPY --from=build /opt/context/node_modules ./node_modules

USER node
EXPOSE 3025

CMD ["node", "context/main.js"]
