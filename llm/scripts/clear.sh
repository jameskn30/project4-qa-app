#!/bin/bash
all=$(sudo docker ps -a -q)

sudo docker stop $all
sudo docker remove $all