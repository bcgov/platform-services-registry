FROM --platform=$BUILDPLATFORM golang:1.23-alpine AS builder

ARG TARGETOS
ARG TARGETARCH
ARG MINIO_COMMIT=16f8cf1c52f0a77eeb8f7565aaf7f7df12454583

RUN apk add --no-cache git

WORKDIR /src

RUN git clone https://github.com/minio/minio.git . \
    && git checkout "${MINIO_COMMIT}"

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build \
      -trimpath \
      -ldflags "$(go run buildscripts/gen-ldflags.go)" \
      -o /out/minio .

FROM alpine:3.24.2

RUN apk add --no-cache ca-certificates

COPY --from=builder /out/minio /usr/bin/minio

ADD --checksum=sha256:c6a01decb5d104ef7327d0d642ce34bcc2396e600a1b7ba03568ac65b3d473be \
    https://raw.githubusercontent.com/minio/minio/16f8cf1c52f0a77eeb8f7565aaf7f7df12454583/dockerscripts/docker-entrypoint.sh \
    /usr/bin/docker-entrypoint.sh

RUN chmod 755 /usr/bin/minio /usr/bin/docker-entrypoint.sh \
    && /usr/bin/minio --version

USER 1001

EXPOSE 9000 9001

ENTRYPOINT ["/usr/bin/docker-entrypoint.sh"]
CMD ["minio"]
