FROM node:10.14-alpine

ARG NODE_MAJOR_VERSION=10
ARG NODE_VERSION=10.14.x

ENV WORK_PATH /opt/app

RUN apk update && \
  apk upgrade && \
  apk add bash git

RUN find / -perm +6000 -type f -not -path '/proc/*' -exec chmod a-s {} \; || true

WORKDIR $WORK_PATH

# COPY package.json $WORK_PATH
# COPY package-lock.json $WORK_PATH
# COPY tsconfig.json $WORK_PATH
# COPY tslint.json $WORK_PATH

# RUN npm ci --silent

EXPOSE 8089 9229
CMD [ "npm", "run", "dev" ]
