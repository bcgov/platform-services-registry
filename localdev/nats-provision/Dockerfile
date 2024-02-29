
FROM node:20-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json", "setup.js", "./"]

RUN npm install --ignore-scripts

USER node

CMD ["node", "setup.js"]
