FROM node:12.0-alpine

ARG NODE_MAJOR_VERSION=10
ARG NODE_VERSION=10.14.x

ENV WORK_PATH /opt/app

RUN apk update && \
  apk upgrade && \
  apk add bash git

RUN find / -perm +6000 -type f -not -path '/proc/*' -exec chmod a-s {} \; || true

WORKDIR $WORK_PATH

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
