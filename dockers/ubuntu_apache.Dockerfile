FROM ubuntu

RUN apt update && apt install -y apache2 curl nano

CMD ["/usr/sbin/apachectl", "-D", "FOREGROUND"]