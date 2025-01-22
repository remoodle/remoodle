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
    compose-db.yml
    /data
      /mongo
      /redis
    docker-compose.yml
    .env.backend
    .env.tgbot
    varopeon.json
```

##### compose-db.yml

```yml
services:
  redis:
    image: redis:7.4.0
    restart: always
    command: redis-server --maxmemory-policy noeviction
    volumes:
      - ./data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"

  mongo:
    image: mongo:7.0.5
    restart: always
    volumes:
      - ./data/mongo:/data/db
    ports:
      - "127.0.0.1:27017:27017"
```

##### docker-compose.yml

```yml
services:
  api:
    image: ghcr.io/remoodle/backend:trunk
    restart: always
    env_file:
      - .env.api
    environment:
      - SERVICE_NAME=api
    ports:
      - "9000:9000"

  cluster:
    image: ghcr.io/remoodle/backend:trunk
    restart: always
    volumes:
      - ./vaporeon.json:/app/apps/backend/dist/services/cluster/vaporeon.json
    env_file:
      - .env.cluster
    environment:
      - SERVICE_NAME=cluster

  tgbot:
    image: ghcr.io/remoodle/tgbot:trunk
    restart: always
    env_file:
      - .env.tgbot
    environment:
      - BACKEND_URL=http://api:9000
    ports:
      - "8888:8888"
```

### Cloud init

`cat /var/log/cloud-init-output.log`
