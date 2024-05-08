FROM ghcr.io/zaproxy/zaproxy:2.15.0

WORKDIR /opt/zap

USER root

RUN apt-get update \
    && apt-get install -y jq \
    && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER zap
ENV HOME /tmp

ENTRYPOINT ["/entrypoint.sh"]
