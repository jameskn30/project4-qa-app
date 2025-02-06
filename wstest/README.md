# Websocket test directory

using global node
$ npm install -g wscat

# Simulate scenarios

- 1000 users make 1000 ws connections to server instances:

- can it handle it all, test if redis pubsub works properly between chatapi instances

- 1000 users may join many rooms, make sure message goes to the intended room only

