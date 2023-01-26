FROM node:alpine
WORKDIR /usr/app
COPY ./package*.json /usr/app/

RUN npm install

COPY ./ /usr/app/
EXPOSE 4002

CMD node server