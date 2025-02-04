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

6. Redis PubSub
8. Test the performance, how system handles communication between different instances with PubSub
9. Push to Koyeb, find out the way to deploy and scale multiple instances if usage increases 
11. Setup sentry for logging, monitor, performance reports
12. next.js act as proxy between client and FastAPI (do integration between 2 systems)
2. Setup pytest basic, unittest, integration test, loads test
3. Setup basic Docker

# DONE
1. Setup fastapi project [OK]
4. Build simple websocket app [OK]
5. add websocket to FastAPI [OK]
7. added  basic endpoints [OK]



