FROM node:22.2.0-alpine3.19

WORKDIR /sandbox

COPY package.json package-lock.json tsconfig.json ./
COPY ../m365proxy/mocks.json ./m365proxy/mocks.json
COPY src ./src

RUN npm install
RUN npm run build

RUN mkdir -p ./dist/m365proxy && cp ./m365proxy/mocks.json ./dist/m365proxy/mocks.json

USER node

EXPOSE 4040

CMD ["node", "dist/server.js"]
