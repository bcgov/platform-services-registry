FROM ubuntu:24.04

WORKDIR /opt/app

RUN apt-get update -q && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -yqq \
    wget \
    unzip \
    libicu-dev \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN wget --max-redirect=1 -O dev-proxy.zip https://github.com/microsoft/dev-proxy/releases/download/v0.17.1/dev-proxy-linux-x64-v0.17.1.zip && \
    unzip dev-proxy.zip && \
    chmod +x ./devproxy

COPY mocks.json .
COPY devproxyrc.json .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

WORKDIR /opt/devserver

ENTRYPOINT ["/entrypoint.sh"]
