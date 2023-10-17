FROM ubuntu:22.04

WORKDIR /opt/m365

RUN apt-get update -q && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -yqq \
    wget \
    unzip \
    libicu-dev \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN wget https://github.com/microsoft/m365-developer-proxy/releases/download/v0.12.1/m365-developer-proxy-linux-x64-v0.12.1.zip && \
    unzip m365-developer-proxy-linux-x64-v0.12.1.zip && \
    chmod +x ./m365proxy

COPY responses.json .
EXPOSE 8000

CMD ["./m365proxy",  "--failure-rate", "0"]
