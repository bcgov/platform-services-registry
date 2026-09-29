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
COPY --from=builder /src/dockerscripts/docker-entrypoint.sh /usr/bin/docker-entrypoint.sh
COPY --from=builder /src/LICENSE /licenses/LICENSE
COPY --from=builder /src/CREDITS /licenses/CREDITS

RUN chmod +x /usr/bin/minio /usr/bin/docker-entrypoint.sh \
    && /usr/bin/minio --version

USER 1001

EXPOSE 9000 9001

ENTRYPOINT ["/usr/bin/docker-entrypoint.sh"]
CMD ["minio"]
