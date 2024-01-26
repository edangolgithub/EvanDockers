###
mysql client connect

```
docker run -p3306:3306 -e "MARIADB_ROOT_PASSWORD=secret" mariadb
docker run -p3306:3306 -e "MYSQL_ROOT_PASSWORD=secret" mysql
docker run -p3306:3306 -v /home/evan/evan/EvanDockers/volumes/mysql:/var/lib/mysql -e "MYSQL_ROOT_PASSWORD=secret" mysql
sudo apt install mariadb-client-core-10.6
mysql -h 127.0.0.1 -P 3306 -u root -p

```
```docker volume create mysql_volume
docker run -p3306:3306 --network=mysql-network -v mysql_volume:/var/lib/mysql -e "MYSQL_ROOT_PASSWORD=secret" mysql
```
```
echo 1 > /proc/sys/vm/drop_caches
```