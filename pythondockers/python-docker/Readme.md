docker run --rm -d -v mysql:/var/lib/mysql -v mysql_config:/etc/mysql -p 3306:3306  --network mysqlnet  --name mysqldb   -e MYSQL_1

docker run --rm -d --network mysqlnet --name rest-server -p 5000:5000 python-docker-dev

docker run --rm -d -v mysql:/var/lib/mysql \
  -v mysql_config:/etc/mysql -p 3306:3306 \
  --network mysqlnet \
  --name mysqldb \
  -e MYSQL_ROOT_PASSWORD=mysqlpassword \
  mysql