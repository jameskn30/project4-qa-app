from fastapi import APIRouter, HTTPException
from haystack.document_stores import InMemoryDocumentStore
from haystack.nodes import PreProcessor, EmbeddingRetriever
from haystack.pipelines import Pipeline
from groq import GroqClient

router = APIRouter()

@router.post("/group_messages")
async def group_messages(messages: list[str]):
    pass
    return {"message": "OK"}

