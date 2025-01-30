FROM nginx:alpine

# copy static files
COPY assets/index.html /usr/share/nginx/html/
COPY assets/styles.css /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

# port
EXPOSE 70

CMD ["nginx", "-g", "daemon off;"]
