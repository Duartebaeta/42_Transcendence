FROM nginx:latest

WORKDIR /etc/nginx

COPY ./default.conf /et/nginx/nginx.conf

COPY ./ssl /etc/nginx/ssl

COPY ./frontend /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]