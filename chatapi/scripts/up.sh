#!/bin/bash

# Function to remove all Docker containers
remove_all_containers() {
    all=$(sudo docker ps -a -q)
    if [ -n "$all" ]; then
        sudo docker rm -f $all
    else
        echo "No containers to remove."
    fi
}

# Check if --purge is present in the argument list
if [[ " $@ " =~ " --purge " ]]; then
    echo "Purging all Docker containers..."
    remove_all_containers
fi

sudo docker compose build

if [[ " $@ " =~ " --detach " ]]; then
    sudo docker compose up -d
else
    sudo docker compose up
fi

