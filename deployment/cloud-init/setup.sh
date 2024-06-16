#!/bin/bash

apt-get update
apt-get install -y nginx

# Add Docker's official GPG key
apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker Network
docker network create --subnet=172.19.0.0/16 r1ng

docker volume create mysql_data
docker volume create mongodb_data

# Nginx configuration
echo 'server { listen 80; listen [::]:80; server_name aitu0.remoodle.app; location / { proxy_pass http://localhost:4000; include proxy_params; } }' > /etc/nginx/sites-available/aitu0
ln -s /etc/nginx/sites-available/aitu0 /etc/nginx/sites-enabled/

echo 'server { listen 80; listen [::]:80; server_name api.remoodle.app; location / { proxy_pass http://localhost:9000; include proxy_params; } }' > /etc/nginx/sites-available/api
ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/

systemctl restart nginx
