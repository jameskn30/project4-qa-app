#!/bin/bash

source .env/bin/activate
ENV_TYPE='dev'


sudo docker stop redis
sudo docker rm redis

echo "Running redis"
sudo docker run -d --name redis -p 6379:6379 redis

echo "Running fastapi"
python ./app/main.py
