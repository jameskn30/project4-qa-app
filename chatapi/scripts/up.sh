#!/bin/bash

# Function to display help message
display_help() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  --purge     Remove all Docker containers before building and runnning"
    echo "  --detach    Run Docker containers in detached mode"
    echo "  --help      Display help message"
}

# Check if --help is present in the argument list
if [[ " $@ " =~ " --help " ]]; then
    display_help
    exit 0
fi

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

