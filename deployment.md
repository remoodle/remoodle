# Deployment

## Preparing a VPS

```setup.sh
#!/bin/bash

apt-get update

# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Creating a shared network
docker network create --subnet=172.19.0.0/16 r1ng

# Docker login to GitHub Container Registry
echo "$GH_PAT" | docker login ghcr.io -u USERNAME --password-stdin
```

## Setting up a host

```
/remoodle
    /db
        docker-compose.yml
        /data
            /mongo
            /mysql
            /redis
    /aitu
        docker-compose.yml
        .env.backend
        .env.core
```

### Database

docker exec -it db-redis-1 redis-cli
XGROUP CREATE stream:grade-change notifier $ MKSTREAM

##### docker-compose.yml
```yml
version: "3.8"

services:
  redis:
    image: redis:7.4.0
    restart: always
    volumes:
      - ./data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - shared

  mongo:
    image: mongo:7.0.5
    restart: always
    volumes:
      - ./data/mongo:/data/db
    ports:
      - "127.0.0.1:27017:27017"
    networks:
      - shared

  mysql:
    image: mysql:8.2
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: remoodle_aitu
      MYSQL_USER: username
      MYSQL_PASSWORD: password
    volumes:
      - ./data/mysql:/var/lib/mysql
    networks:
      - shared
    ports:
      - "127.0.0.1:3306:3306"

networks:
  shared:
    name: r1ng
    external: true
```

### Apps

##### docker-compose.yml
```yml
version: '3.8'

services:
  core:
    image: ghcr.io/remoodle/core:0.2.2
    restart: always
    networks:
      - shared
    env_file:
      - .env.core
    ports:
      - "8080:8080"

  backend:
    image: ghcr.io/remoodle/backend:0.2.14
    restart: always
    networks:
      - shared
    env_file:
      - .env.backend
    environment:
      - CORE_URL=http://core:8080
    ports:
      - "80:9000"

networks:
  shared:
    name: r1ng
    external: true
```

# Migration

docker exec -it db-mysql-1 mysql -u root -p
docker cp remoodle.users.json remoodle-mongo-1:/data.json

docker exec -it db-mongo-1 bash
mongoimport --db remoodle --collection users --file data.json --jsonArray

### Cloud init

cat /var/log/cloud-init-output.log

