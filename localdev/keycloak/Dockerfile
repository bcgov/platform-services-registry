
FROM golang:1.23.4-bullseye as build

WORKDIR /opt

RUN git clone https://github.com/FiloSottile/mkcert && cd mkcert &&\
    go build -ldflags "-X main.Version=$(git describe --tags)" &&\
    ./mkcert localhost &&\
    chmod 755 localhost.pem &&\
    chmod 755 localhost-key.pem

FROM quay.io/keycloak/keycloak:22.0.5

COPY --from=build /opt/mkcert/localhost.pem /opt/keycloak/conf/server.crt.pem
COPY --from=build /opt/mkcert/localhost-key.pem /opt/keycloak/conf/server.key.pem

WORKDIR /opt/keycloak/bin
