FROM registry.access.redhat.com/ubi8/openjdk-11

RUN mkdir flyway
WORKDIR /flyway

USER 0
microdnf -y install gzip

ENV FLYWAY_VERSION 7.5.3

RUN curl -sLo ./flyway-commandline-${FLYWAY_VERSION}.tar.gz https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz
RUN ls -l 
RUN tar -xzf flyway-commandline-${FLYWAY_VERSION}.tar.gz
RUN ls -l 
RUN mv flyway-${FLYWAY_VERSION}/* .
RUN ls -l 
RUN rm flyway-commandline-${FLYWAY_VERSION}.tar.gz

ENV PATH="/flyway:${PATH}"
COPY sql/*.sql /flyway/sql/

RUN chmod -R 777 .

USER jboss
