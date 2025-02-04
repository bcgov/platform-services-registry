FROM nginx:1.25.3-alpine

RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

# permissions for the non-root user
RUN chown -R nonroot:nonroot /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run

# Switch to nonroot user
USER nonroot

COPY static /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
