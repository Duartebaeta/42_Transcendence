FROM nginx:latest

WORKDIR /etc/nginx

COPY nginx/nginx.conf /et/nginx/nginx.conf

COPY nginx/ssl /etc/nginx/ssl

COPY nginx/frontend /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]