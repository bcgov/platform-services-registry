ARG deployment_tag

# 1st stage to build the image
FROM node:22.1.0-alpine3.19 as build

WORKDIR /app

COPY . .

ENV SECURE_HEADERS=true \
  DEPLOYMENT_TAG=${deployment_tag}

RUN npm install
RUN npm run build

# 2nd stage to copy image and create a smaller final image
# FROM gcr.io/distroless/nodejs18-debian12
FROM node:22.1.0-alpine3.19

WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

RUN mkdir -p .next/cache/images &&\
    chmod -R 777 .next/cache/images

ENV NEXTAUTH_SECRET changeme

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
