#!/bin/bash
ENV_TYPE="dev"

source .env/bin/activate

echo "Running redis"
#sudo docker run -d --name redis -p 6379:6379 redis

echo "Running fastapi"
python ./app/main.py
