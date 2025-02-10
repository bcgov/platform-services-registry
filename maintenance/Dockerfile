FROM nginx:1.27.4-alpine

RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

COPY maintenance/static /usr/share/nginx/html
COPY maintenance/nginx.conf /etc/nginx/nginx.conf

RUN chown -R nonroot:nonroot /usr/share/nginx/html /etc/nginx/nginx.conf
USER nonroot
EXPOSE 3000
