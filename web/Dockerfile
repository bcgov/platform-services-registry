FROM node:12.0-alpine

ARG NODE_MAJOR_VERSION=12
ARG NODE_VERSION=12.0.x

ENV WORK_PATH /opt/app

RUN apk update && \
  apk upgrade && \
  apk add bash git

RUN find / -perm +6000 -type f -not -path '/proc/*' -exec chmod a-s {} \; || true

WORKDIR $WORK_PATH

EXPOSE 8101 9229

CMD [ "npm", "start" ]
