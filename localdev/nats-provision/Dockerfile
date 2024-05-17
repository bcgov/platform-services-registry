FROM node:22.2.0-alpine3.19

RUN apk update && \
    apk add --no-cache curl

WORKDIR /app

COPY ["package.json", "package-lock.json", "setup.js", "./"]

RUN npm install --ignore-scripts

USER node

CMD ["node", "setup.js"]
