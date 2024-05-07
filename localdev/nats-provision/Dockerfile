
FROM node:22.1.0-alpine3.19

WORKDIR /app

COPY ["package.json", "package-lock.json", "setup.js", "./"]

RUN npm install --ignore-scripts

USER node

CMD ["node", "setup.js"]
