ARG deployment_tag

# 1st stage to build the image
FROM node:22.12.0-alpine3.19 AS build

WORKDIR /app

COPY app .
COPY sandbox/types.ts /sandbox/types.ts
COPY sandbox/mock-users.json /sandbox/mock-users.json
COPY .prettierignore .prettierrc ./

ENV SECURE_HEADERS=true \
  DEPLOYMENT_TAG=${deployment_tag}

# Install system dependencies (for compiling canvas)
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    libpng-dev \
    librsvg-dev

# Install Node tools and dependencies
RUN npm install -g turbo pnpm && \
    pnpm install --frozen-lockfile

# Rebuild canvas
RUN cd node_modules/.pnpm/canvas@3.2.0/node_modules/canvas && \
    pnpm add -D node-gyp && \
    pnpm exec node-gyp rebuild

# Run project build steps
RUN npx ts-node scripts/render-react-email-tailwind-style.ts && \
    pnpm build

# 2nd stage to copy image and create a smaller final image
# FROM gcr.io/distroless/nodejs18-debian12
FROM node:22.12.0-alpine3.19

WORKDIR /app

# Copy built artifacts from build stage
COPY --from=build /app/.next .next
COPY --from=build /app/next.config.js ./
COPY --from=build /app/public public
COPY --from=build /app/package.json package.json
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/prisma/client prisma/client

# Install system dependencies (for running canvas)
RUN apk add --no-cache \
    cairo \
    pango \
    jpeg \
    giflib \
    libpng \
    librsvg \
    fontconfig \
    freetype \
    ttf-dejavu

# Ensure Next.js image cache dir is writable
RUN install -d -m 0777 .next/cache/images

# Set environment variables
ARG BUILD_TIMESTAMP
ENV BUILD_TIMESTAMP=${BUILD_TIMESTAMP} \
    NEXTAUTH_SECRET=changeme \
    TZ=America/Vancouver

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
