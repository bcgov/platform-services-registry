FROM nginx:1.29.3-alpine

RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

COPY static /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN chown -R nonroot:nonroot /usr/share/nginx/html /etc/nginx/nginx.conf
USER nonroot
EXPOSE 3000
