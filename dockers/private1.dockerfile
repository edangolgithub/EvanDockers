# private.dockerfile

FROM ubuntu

# Install necessary tools
RUN apt update && apt install -y apache2 curl nano unzip

# Set your GitHub Personal Access Token
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

# Use curl to download the private repository
RUN curl -LJO "https://codeload.github.com/edangolgithub/evanhtmlprivate/zip/refs/heads/master" -H "Authorization: token $GITHUB_TOKEN"

# Unzip the downloaded file
RUN unzip -q evanhtmlprivate-master.zip -d /var/www/html/

# Move the contents
RUN mv /var/www/html/evanhtmlprivate-master/* /var/www/html/

# Start Apache in the foreground
CMD ["/usr/sbin/apachectl", "-D", "FOREGROUND"]
