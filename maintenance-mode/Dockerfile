FROM nginx:alpine

# nonroot user
RUN addgroup -S nonrootuser && adduser -S nonrootuser -G nonrootuser

# cache directories and change ownership
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /tmp/nginx && \
    chown -R nonrootuser:nonrootuser /var/cache/nginx /tmp/nginx

# static files
COPY assets/index.html /usr/share/nginx/html/
COPY assets/styles.css /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

# ownership of static files
RUN chown -R nonrootuser:nonrootuser /usr/share/nginx/html

# use non-root user
USER nonrootuser

# use non-root port
EXPOSE 7070

CMD ["nginx", "-g", "daemon off;"]
