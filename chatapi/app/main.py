from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from logging.handlers import TimedRotatingFileHandler
import os
from datetime import datetime
from routers import chat, llm
import asyncio
from data.websocket_manager import WebSocketManager

# Get environment type
env_type = os.getenv("ENV_TYPE", "dev")

# Create logs directory if it doesn't exist
if not os.path.exists("logs"):
    os.makedirs("logs")

# Clean up old log files if there are more than 10
log_files = sorted([f for f in os.listdir("logs") if f.startswith("logging_")], reverse=True)
if len(log_files) > 10:
    os.remove(os.path.join("logs", log_files[-1]))

# Configure logging
log_filename = f"logs/logging_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        TimedRotatingFileHandler(log_filename, when="midnight", interval=1),
        logging.StreamHandler()
    ]
)

async def get_websocket_manager():
    return WebSocketManager()

logger = logging.getLogger(__name__)

app = FastAPI()

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthcheck")
def healthcheck():
    logger.info("Healthcheck endpoint was called")
    return {"status": "ok"}

# app.include_router(chat.router)
app.include_router(llm.router)
    
#TODO:
# add sentry for monitoring

@app.on_event("startup")
def startup_event():
    logger.info("Startup events:")
    # asyncio.create_task(chat.redis_listener())
    logger.info("redis_listener task started")

if __name__ == "__main__":
    import uvicorn
    # SERVER_WORKERS = int(os.getenv("SERVER_WORKERS", 1))
    logger.info("Starting the FastAPI application")
    logger.info("ENV_TYPE: " +  env_type)
    reload = False
    if env_type == "dev":
        reload = True
    uvicorn.run('main:app', host="0.0.0.0", port=8000 , reload = reload )
