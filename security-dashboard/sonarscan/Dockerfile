FROM sonarsource/sonar-scanner-cli:10.0.0

WORKDIR /opt/sonar

RUN apk update && \
    apk add --no-cache jq

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV GH_TOKEN ''
ENV PROJECTS ''
ENV CONTEXT ''
ENV SONARQUBE_URL ''
ENV SONARQUBE_TOKEN ''
ENV SONARQUBE_USER ''
ENV SONARQUBE_PASS ''

ENTRYPOINT ["/entrypoint.sh"]
