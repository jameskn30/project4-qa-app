from fastapi import FastAPI
import logging
from logging.handlers import TimedRotatingFileHandler
import os
from datetime import datetime
from routers import llm
import sys

# Add the llm directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

app = FastAPI()

# SETUP LOGS
if not os.path.exists("logs"):
    os.makedirs("logs")

log_files = sorted([f for f in os.listdir("logs") if f.startswith("logging_")], reverse=True)
if len(log_files) > 10:
    os.remove(os.path.join("logs", log_files[-1]))

log_filename = f"logs/logging_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        TimedRotatingFileHandler(log_filename, when="midnight", interval=1),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# SETUP ROUTES
app.include_router(llm.router, prefix="/llm")


@app.get("/healthcheck")
async def healthcheck():
    return {"message": "ok"}


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting the LLM API, env = {os.environ.get('ENV', 'dev')}")
    # Only in dev mode
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
