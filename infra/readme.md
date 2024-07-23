# Deployment

cat /var/log/cloud-init-output.log

# Docker compose database

docker compose up -d

docker exec -it db-redis-1 redis-cli
XGROUP CREATE stream:grade-change notifier $ MKSTREAM

# Migration

docker exec -it db-mysql-1 mysql -u root -p
docker cp remoodle.users.json remoodle-mongo-1:/data.json

docker exec -it db-mongo-1 bash
mongoimport --db remoodle --collection users --file data.json --jsonArray
