# Pull the httpd image from DockerHub repository to build our application as a base
FROM php:7.3-apache
# Copy the static page from the target directory to apache2 docs
COPY ./public-html/ /var/www/html