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

- next.js act as proxy between client and FastAPI (do integration between 2 systems)
- Test the performance, how system handles communication between different instances with PubSub
- Push to Koyeb, find out the way to deploy and scale multiple instances if usage increases 
- Setup sentry for logging, monitor, performance reports
- Setup pytest basic, unittest, integration test, loads test
- Add a buffer to messages. will need to handle this when there are 10k people sending messages to the server that same time -> every new message, system scans all users in room, send message to each websocket,Having a buffer, collect messages and will send many messages to each user for every scan, 


# DONE
- Setup fastapi project [OK]
- Build simple websocket app [OK]
- add websocket to FastAPI [OK]
- added  basic endpoints [OK]
- Redis PubSub [OK]
- Setup basic Docker, compose redis and docker image for chatpi [OK]

# TESTS IDEAS:

- users in different server same room: user1 in server1 chatroom = 1, user2 in server2 chatroom =1, user1 can send message to users2 with redis pubsub
- users in different server different room: user1 in server1 chatroom = 1, user2 in server2 chatroom = 2, user1 can not send message to users2 with redis pubsub


