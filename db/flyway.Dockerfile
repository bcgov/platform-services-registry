FROM boxfuse/flyway:5.2.4-alpine

COPY sql/*.sql /flyway/sql/