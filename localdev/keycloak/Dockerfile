
FROM golang:1.21.3-bullseye as build

WORKDIR /opt

RUN git clone https://github.com/FiloSottile/mkcert && cd mkcert &&\
    go build -ldflags "-X main.Version=$(git describe --tags)" &&\
    ./mkcert localhost &&\
    chmod 755 localhost.pem &&\
    chmod 755 localhost-key.pem

FROM quay.io/keycloak/keycloak:22.0.4

COPY --from=build /opt/mkcert/localhost.pem /opt/keycloak/conf/server.crt.pem
COPY --from=build /opt/mkcert/localhost-key.pem /opt/keycloak/conf/server.key.pem
COPY realm.json /opt/keycloak/data/imports/realm.json

# See https://github.com/bitnami/containers/tree/main/bitnami/keycloak#initializing-a-new-instance
# COPY init.sh /docker-entrypoint-initdb.d/init.sh

# RUN chmod 555 /opt/keycloak/imports/realm.json2

WORKDIR /opt/keycloak/bin
