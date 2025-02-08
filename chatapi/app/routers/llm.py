from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from pipelines.message_rephrase import rephrase_messages, load_groq_llm, load_ollama_llm
import logging
import os

# Get environment type
env_type = os.getenv("ENV_TYPE", "dev")

router = APIRouter()
logger = logging.getLogger(__name__)

class MessagesRequest(BaseModel):
    messages: List[str]

@router.post("/group_messages")
async def group_messages(request: MessagesRequest):
    """
    Group messages based on their embeddings.
    
    :param request: Request body containing a list of messages.
    :return: List of grouped messages.
    """

    #Use OLLAMA for dev environment, else use GROQ
    logger.info("/group_messages")
    if env_type == 'dev':
        llm = load_ollama_llm()
    else:
        llm = load_groq_llm()

    rephrases = rephrase_messages(request.messages, llm)
    
    logger.info("LLM done grouping messages")
    return {'message': rephrases}


