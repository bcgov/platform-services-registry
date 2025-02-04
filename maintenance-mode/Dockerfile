FROM nginx:1.25.3-alpine

RUN chown -R 1001:0 /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run \
    && chmod -R g+w /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run

USER 1001

COPY static /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
