# Backend design decisions of backend

- FastAPI python
- Websocket connection <==>
- client <==> next.js app is proxy <==> FastAPI
- Redis Pub/Sub to distribute messages across multiple FastAPI instance on the cloud
- 

# Starter commands

# Tech stack
https://fastapi.tiangolo.com/project-generation/

# TODO

2. Setup pytest basic
3. Setup basic Docker
5. Connect next.js to websocket, next.js act as proxy between client and FastAPI
6. Redis PubSub
7. Start with basic endpoints
8. Test the performance
9. Push to Koyeb, find out the way to deploy and scale multiple instances if usage increases 
10. Find out how to test if multiple FastAPI instances work properly in group chat settings
11. Setup sentry for logging, monitor, performance reports
12. Improve the routing organization

# DONE
1. Setup fastapi project [OK]
4. Build simple websocket app [OK]


