from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from pipelines.message_rephrase import rephrase_messages, load_groq_llm
import logging

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
    logger.info("/group_messages")
    groq = load_groq_llm()
    rephrases = rephrase_messages(request.messages, groq)
    
    logger.info("LLM done grouping messages")
    return {'message': rephrases}


