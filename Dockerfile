FROM node:16

WORKDIR /usr/src/app

COPY . .
RUN npm install -f
CMD ["npm", "run", "dev"]



