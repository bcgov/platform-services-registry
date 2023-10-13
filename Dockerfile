FROM node:16-alpine as BUILD

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

RUN npm run build

# A multi-stage build to create a smaller final image
FROM node:16-alpine

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=BUILD /app/.next ./.next
COPY --from=BUILD /app/public ./public
COPY --from=BUILD /app/package.json ./
COPY --from=BUILD /app/node_modules ./node_modules

RUN mkdir /.npm
RUN chgrp -R 0 /.npm && \
    chmod -R g=u /.npm

EXPOSE 3000
CMD ["npm", "start"]
