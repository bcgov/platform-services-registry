FROM node:22.2.0-alpine3.19

WORKDIR /sandbox

COPY ./_packages ./_packages
COPY ./tsconfig.json ./tsconfig.json
COPY ./m365proxy ./m365proxy
COPY ./src ./src

RUN npm install

RUN npm run build

USER node

EXPOSE 4040

CMD ["node", "dist/server.js"]
