#!/bin/bash

# Function to display help message
display_help() {
    echo "Usage: $0 [options]"
    echo "Options: argument order is corresponded to the order of execution"
    echo "  --purge     Remove all Docker containers before building and running"
    echo "  --down      Shutdown all services related to this and remove images and volumes"
    echo "  --detach    Run Docker containers in detached mode"
    echo "  --help      Display help message"
}

# Check if --help is present in the argument list
if [[ " $@ " =~ " --help " ]]; then
    display_help
    exit 0
fi

# Function to remove all Docker containers

# Check if --down is present in the argument list
if [[ " $@ " =~ " --down " ]]; then
    if [[ " $@ " =~ " --purge " ]]; then
        echo "Shutting down all services and removing images and volumes..."
        sudo docker-compose down --rmi all --volumes
    else
        echo "Shutting down all services"
        sudo docker-compose down --rmi all --volumes
    fi
    exit 0
fi

sudo docker compose build 

# Check if --detach is present in the argument list
if [[ " $@ " =~ " --detach " ]]; then
    echo "Running Docker containers in detached mode..."
    sudo docker-compose up -d
else
    sudo docker-compose up
fi