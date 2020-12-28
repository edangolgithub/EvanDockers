#docker run --name=mysql2  --restart on-failure -d mysql:latest
docker run --name=mysql2 -e MYSQL_USER=root MYSQL_ROOT_PASSWORD=root -d mysql:latest