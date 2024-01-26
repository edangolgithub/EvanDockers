FROM ubuntu

RUN apt update && apt install -y apache2 curl nano unzip

ADD https://codeload.github.com/edangolgithub/evanhtml/zip/refs/heads/master /var/www/html/code.zip

RUN cd /var/www/html/ && unzip code.zip && mv /var/www/html/evanhtml-master/* /var/www/html/

CMD ["/usr/sbin/apachectl", "-D", "FOREGROUND"]

