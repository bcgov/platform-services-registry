FROM node:22.10.0-alpine3.19 AS build
WORKDIR /context

COPY ches-mock/package.json ches-mock/package-lock.json ches-mock/tsconfig.json ./
COPY ches-mock/src ./src

RUN npm install && npm run build

FROM node:22.10.0-alpine3.19
WORKDIR /context

COPY --from=build /context/build ./build
COPY --from=build /context/package.json /context/package-lock.json ./

RUN npm install --only=production

USER node
EXPOSE 3025

CMD ["node", "build/main.js"]
