# Frontend design decisions


# Starter commands

# Tech stack
- Next.js
- shadcn/ui
- vercel for deployment


# TODO
- send, receive messages from users feature


# DONE
- setup basic layout

--
# TESTS

## UNIT TESTS CASES UI:

## UNIT TESTS CASES UI:
- test websocket endpoints, 
- test if websocket events handled correctly
- test if handles properly for redis

## INTEGRATION TESTS CASES, on Next.js:
- test integration with chatapi
- test api endpoints,
- test websocket endpoints
- test, client side, how websocket behaves in each event  

## E2E CASES:

## SNAPSHOT CASES:

## LOAD TEST CASES:
- 1 room, test script to make websocket connection to chatapi, send a lot of messages, join and leave multiple times, scale the test to 100 500 100 10k

- multiple rooms at the same time, test the 1 room case, scale: 10 room, 20 room, 50 room, 100 room, 200 room, 500 room

- want to establish some metrics for backend performance