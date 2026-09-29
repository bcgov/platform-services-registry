FROM alpine:3.24.2 AS builder

ARG TARGETARCH
ARG MINIO_RELEASE=RELEASE.2024-12-18T13-15-44Z

RUN apk add --no-cache \
    ca-certificates \
    curl \
    minisign

WORKDIR /build

RUN curl --proto '=https' --proto-redir '=https' -fsSL \
      "https://dl.min.io/server/minio/release/linux-${TARGETARCH}/archive/minio.${MINIO_RELEASE}" \
      -o /minio \
    && curl --proto '=https' --proto-redir '=https' -fsSL \
      "https://dl.min.io/server/minio/release/linux-${TARGETARCH}/archive/minio.${MINIO_RELEASE}.minisig" \
      -o /minio.minisig \
    && chmod +x /minio \
    && minisign -Vqm /minio \
      -x /minio.minisig \
      -P RWTx5Zr1tiHQLwG9keckT0c45M3AGeHD6IvimQHpyRywVWGbP1aVSGav

ADD --checksum=sha256:<ENTRYPOINT_SHA256> \
    https://raw.githubusercontent.com/minio/minio/16f8cf1c52f0a77eeb8f7565aaf7f7df12454583/dockerscripts/docker-entrypoint.sh \
    /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

FROM alpine:3.24.2

RUN apk add --no-cache ca-certificates

COPY --from=builder /minio /usr/bin/minio
COPY --from=builder /docker-entrypoint.sh /usr/bin/docker-entrypoint.sh

RUN /usr/bin/minio --version

USER 1001

EXPOSE 9000 9001

ENTRYPOINT ["/usr/bin/docker-entrypoint.sh"]
CMD ["minio"]
