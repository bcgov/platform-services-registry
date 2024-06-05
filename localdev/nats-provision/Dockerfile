FROM node:22.2.0-alpine3.19

RUN apk update && \
    apk add --no-cache curl

WORKDIR /app

COPY . .

RUN npm install --ignore-scripts
RUN npm run build

USER node
CMD ["node", "build/main.js"]
