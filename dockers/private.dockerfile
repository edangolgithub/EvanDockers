# private.dockerfile

FROM ubuntu

# Install necessary tools
RUN apt update && apt install -y apache2 curl nano unzip

# Set your GitHub Personal Access Token
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

# Use curl to download the private repository
RUN curl -LJO "https://codeload.github.com/edangolgithub/evanhtmlprivate/zip/refs/heads/master" -H "Authorization: token $GITHUB_TOKEN" \
    && unzip -q evanhtmlprivate-master.zip -d /var/www/html/ \
    && mv /var/www/html/evanhtmlprivate-master/* /var/www/html/

# Start Apache in the foreground
CMD ["/usr/sbin/apachectl", "-D", "FOREGROUND"]







# https://codeload.github.com/edangolgithub/evanhtmlprivate/zip/refs/heads/master?token=AE5SS4MFXVQL6G2M5NGRT6DFU7PEA
# https://codeload.github.com/edangolgithub/evanhtmlprivate/zip/refs/heads/master?acces_token=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



#pat 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

#docker build --build-arg GITHUB_TOKEN=your_personal_access_token -t your_image_name .
#docker build --build-arg GITHUB_PAT=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 -t evanhtmlprivate -f private.dockerfile .

#docker build --build-arg GITHUB_TOKEN=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 -t evanhtmlprivate -f private.dockerfile .

#docker run -p8888:80 evanhtmlprivate
