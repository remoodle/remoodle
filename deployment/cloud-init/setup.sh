#!/bin/bash

sudo apt update

# Installing Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt-cache policy docker-ce
sudo apt install docker-ce
sudo systemctl status docker

# Creating a shared network
docker network create --subnet=172.19.0.0/16 r1ng

# Create database folders
mkdir db
mkdir db/redis
mkdir db/mysql
mkdir db/mongo