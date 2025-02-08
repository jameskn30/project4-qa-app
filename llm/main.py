from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
import logging
from logging.handlers import TimedRotatingFileHandler
import os
from datetime import datetime
import asyncio
from redis.asyncio import Redis
import json
from chatapi.app.routers import llm as llm_router

app = FastAPI()

# # SETUP LOGS
# if not os.path.exists("logs"):
#     os.makedirs("logs")

# log_files = sorted([f for f in os.listdir("logs") if f.startswith("logging_")], reverse=True)
# if len(log_files) > 10:
#     os.remove(os.path.join("logs", log_files[-1]))

# log_filename = f"logs/logging_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
#     handlers=[
#         TimedRotatingFileHandler(log_filename, when="midnight", interval=1),
#         logging.StreamHandler()
#     ]
# )

# logger = logging.getLogger(__name__)

# # SETUP IN-MEMORY DATA

# # SETUP REDIS
# REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
# REDIS_PORT = os.getenv("REDIS_PORT", "6379")

# redis_client = Redis.from_url(f"redis://{REDIS_HOST}:{REDIS_PORT}")

# async def redis_listener():
#     pubsub = redis_client.pubsub()
#     logger.info("pubsub subscribe to all channels")
#     await pubsub.psubscribe("chat:*")

#     async for message in pubsub.listen():

#         if message['type'] == 'message':
#             pass
#         elif message['type'] == 'pmessage':
#             channel, room_id = message['channel'].decode('utf-8').split(":")
#             data = json.loads(message['data'])
#             username, message = data['username'], data['message']
#             print(f"Received from {username} in channel {channel} message = {message}")

# @app.on_event("startup")
# def startup_event():
#     logger.info("Startup events:")
#     asyncio.create_task(redis_listener())
#     logger.info("redis_listener task started")

# SETUP ROUTES
app.include_router(llm_router.router, prefix="/api")

@app.get("/healthcheck")
async def healthcheck():
    return {"message": "ok"}


if __name__ == "__main__":
    import uvicorn
    # SERVER_WORKERS = int(os.getenv("SERVER_WORKERS", 1))
    logger.info("Starting the FastAPI application")
    # Only in dev mode
    uvicorn.run("llm.main:app", host="0.0.0.0", port=8001, reload=True)
