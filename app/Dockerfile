ARG deployment_tag

# 1st stage to build the image
FROM node:22.15.0-alpine AS build

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/package.json ./app/package.json
COPY app/prisma ./app/prisma

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

ENV CYPRESS_INSTALL_BINARY=0

# Install Node tools and dependencies
RUN npm install -g turbo pnpm@11.0.8 && \
    pnpm install --frozen-lockfile

COPY app ./app
COPY sandbox/types.ts ./sandbox/types.ts
COPY sandbox/mock-users.json ./sandbox/mock-users.json
COPY .prettierignore .prettierrc ./app/

WORKDIR /workspace/app

# Rebuild canvas (avoid hardcoded pnpm virtual store paths)
# If canvas native binary is missing, rebuild it.
RUN test -f node_modules/canvas/build/Release/canvas.node || pnpm rebuild canvas

# Run project build steps
RUN npx ts-node scripts/render-react-email-tailwind-style.ts && \
    pnpm build

# 2nd stage to copy image and create a smaller final image
# FROM gcr.io/distroless/nodejs18-debian12
FROM node:22.15.0-alpine

WORKDIR /app

# Copy built artifacts from build stage
COPY --from=build /workspace/app /app
COPY --from=build /workspace/node_modules /app/node_modules

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
