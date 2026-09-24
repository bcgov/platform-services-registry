FROM --platform=$BUILDPLATFORM golang:1.23.4-alpine AS builder

ARG TARGETOS
ARG TARGETARCH
ARG MC_COMMIT=1681e4497c09d7438a34e846f76dbde972ab7daf

RUN apk add --no-cache git

WORKDIR /src

RUN git clone https://github.com/minio/mc.git . \
    && git checkout "${MC_COMMIT}"

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build \
      -trimpath \
      -ldflags "$(go run buildscripts/gen-ldflags.go)" \
      -o /out/mc .

FROM alpine:3.21.2

RUN apk add --no-cache ca-certificates

COPY --from=builder /out/mc /usr/bin/mc
COPY --from=builder /src/LICENSE /licenses/LICENSE
COPY --from=builder /src/CREDITS /licenses/CREDITS

RUN chmod +x /usr/bin/mc \
    && /usr/bin/mc --version

USER 1001

ENTRYPOINT ["/usr/bin/mc"]
