from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
from pydantic import BaseModel
from uuid import uuid4
from redis.asyncio import Redis
import json
import os
from supabase import create_client, Client
from data.websocket_manager import WebSocketManager, gen_random_phrase, Command

from pipelines.message_rephrase import rephrase_messages, load_groq_llm, load_ollama_llm

# Get environment type
env_type = os.getenv("ENV_TYPE", "dev")

logger = logging.getLogger("chat")

router = APIRouter()

# INIT REDIS =======

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

redis_client = Redis.from_url(f"redis://{REDIS_HOST}:{REDIS_PORT}")

# INIT SUPABASE =======

#TODO: this is not safe, load from env
# SERVICE_KEY is sensitive, it can by pass all row level policy in supabase. DANGEROUS
SUPABASE_URL="https://dypuleqmsczlryhqbuoo.supabase.co"
SUPABASE_SERVICE_KEy="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHVsZXFtc2N6bHJ5aHFidW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTI5MTAwMiwiZXhwIjoyMDU0ODY3MDAyfQ.UxNaQoLzNsspeVWPBRsbAntWKttBTHJMKWtpQt3d0EU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEy)

#==== 

# Type
class RoomRequest(BaseModel):
    roomId: str
    username: Optional[str] = None
    questionId: Optional[str] = None

class UpvoteRequest(BaseModel):
    roomId: str
    username: str
    questionId: str

@dataclass
class UserConnection:
    user_id: str
    username: str
    user_host: str = ""
    websocket: WebSocket = None

#TOOD: centralized manager will be required
websocket_manager = WebSocketManager()

# ROOM
@router.get("/list_members/{room_id}")
def list_members(room_id: str):
    logger.info(f"Listing members in room {room_id}")
    if room_id in websocket_manager.active_room:
        return [websocket_manager.user_id_to_conn[user_id].username for user_id in websocket_manager.active_room[room_id]]
    return []

@router.post("/room_exists")
async def if_room_exists(req: RoomRequest):
    room_id = req.roomId
    if room_id in websocket_manager.active_room:
        return {"message": 'OK'}
    else:
        raise HTTPException(status_code=404, detail=f"Room {room_id} is not found")


@router.get("/get_random_room_id")
async def random_room_id():
    room_id = gen_random_phrase()
    logger.info(f"Generated new room ID: {room_id}")
    return {"roomId": room_id}

@router.post("/create_room")
async def create_room(req: RoomRequest):
    logger.info(f"/create_room")
    room_id = req.roomId
    if not room_id:
        raise HTTPException(status_code=400, detail="Room ID is required")

    if room_id in websocket_manager.active_room:
        detail = f"room {room_id} already exists"
        logger.error(detail)
        raise HTTPException(status_code=400, detail=detail)

    websocket_manager.active_room[room_id] = []

    logger.info(f"deleted room id = {room_id}")
    return {"message": f"Room {room_id} created"}

@router.delete("/delete_room")
async def delete_room(req: RoomRequest):
    room_id = req.roomId
    logger.info(f"/delete_room")
    if room_id not in websocket_manager.active_room:
        detail = f"room {room_id} not found"
        logger.error(detail)
        raise HTTPException(status_code=404, detail=detail)
    
    # disconnect all current connections in the room
    for user_id in websocket_manager.active_room[room_id]:
        await websocket_manager.leave_room(room_id, user_id)

    del websocket_manager.active_room[room_id]
    logger.info(f"Deleted room id = {room_id} ")
    return {"message": f"Room {room_id} deleted successfully"}

@router.post("/is_username_unique")
async def is_username_unique(req: RoomRequest):
    room_id = req.roomId
    if req.username is None:
        raise HTTPException(status_code=400, detail=f"username not provided")

    username = req.username
    logger.info(f"/is_username_unique")

    if not websocket_manager._is_username_unique(room_id, username) or req.username == 'system':
        raise HTTPException(status_code=400, detail=f"Username {username} is already taken in room {room_id}")
    return {"message": "OK"}

@router.get("/sync_room/{room_id}")
async def sync_room(room_id: str):
    # room_id = req.roomId
    logger.info(room_id)
    if room_id not in websocket_manager.active_room:
        logger.error(f"room {room_id} not found")
        raise HTTPException(
            status_code=404, detail=f"Room {room_id} not found")

    logger.info(f"/sync_room")
    messages = websocket_manager.messages[room_id]
    questions = websocket_manager.questions[room_id]
    return {"messages": messages, 'questions': questions}


# SUPABASE

@router.get("/fetch_room/{room_id}")
async def check_room_in_supabase(room_id: str):
    logger.info(f"Checking room {room_id} in Supabase")
    response = supabase.table("room").select("*").eq("id", room_id).execute()
    logger.info(f"Response from Supabase: {response}")
    if response.data:
        return {"message": "Room found", "data": response.data}
    else:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found in Supabase")


# WEBSOCKET 

@router.websocket("/join/{room_id}/{username}")
async def join_room(websocket: WebSocket, room_id: str, username: str):
    if room_id not in websocket_manager.active_room:
        await websocket.close(code=1000, reason=f"Room {room_id} not found")

    elif websocket_manager._is_username_unique(room_id, username) == False:
        msg = f"Username {username} is already taken in room {room_id}"
        await websocket.close(code=1000, reason=msg)

    user_id = None

    try:
        user_id = await websocket_manager.join_room(room_id, websocket, username=username)

        await websocket_manager.notify_new_member(user_id, room_id)

        while True:
            message = await websocket.receive_text()
            await websocket_manager.send_group_message(user_id, message)

    except WebSocketDisconnect as e:
        logger.error(f"WebSocket of user_id {user_id} connection closed for room {room_id}")
    finally:
        if user_id:
            await websocket_manager.leave_room(room_id, user_id)

async def redis_listener():
    pubsub = redis_client.pubsub()
    logger.info("pubsub subscribe to all channels")
    await pubsub.psubscribe("chat:*")

    async for message in pubsub.listen():
        # if pubsub is pattern subscribed, message type is pmessage
        # else type = message

        if message['type'] == 'message':
            pass
        elif message['type'] == 'pmessage':
            channel, room_id = message['channel'].decode('utf-8').split(":")
            if room_id in websocket_manager.active_room:
                data = json.loads(message['data'])
                username, message = data['username'], data['message']
                logger.info(f"Received from {username} in channel {channel} message = {message}")
                print(websocket_manager)
                await websocket_manager._broadcast(room_id, message, username)

## LLM

class MessagesRequest(BaseModel):
    messages: List[str]

@router.post("/group_messages")
async def group_messages(request: RoomRequest):
    """
    Group messages based on their embeddings.
    
    :param request: Request body containing a list of messages.
    :return: List of grouped messages.
    """

    roomId = request.roomId
    username = request.username
    logger.info(f"/group_messages for room {roomId}")

    if roomId not in websocket_manager.active_room:
        raise HTTPException(status_code=404, detail=f"Room {roomId} not found") 

    messages = [msg['content'] for msg in websocket_manager.messages[roomId]]

    await websocket_manager._broad_cast_command(roomId, Command.GROUPING_QUESTIONS)

    if env_type == 'prod':
        llm = load_groq_llm()
    else:
        llm = load_ollama_llm()

    questions = rephrase_messages(messages, llm)

    websocket_manager.questions[roomId] = questions

    #broadcats the result to all users in the room
    logger.info("LLM done grouping messages")

    await websocket_manager._broadcast_grouped_questions(roomId, questions, username)

    return {'message': 'OK'}

@router.post("/upvote")
async def upvote(request: UpvoteRequest):
    room_id = request.roomId
    username = request.username
    question_id = request.questionId
    logger.info("/upvote, username = {username}, room_id = {room_id}, question_id = {question_id}")

    if room_id not in websocket_manager.active_room:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    questions = websocket_manager.questions.get(room_id, [])
    for question in questions:
        if question['uuid'] == question_id:
            question['upvotes'] += 1
            await websocket_manager._broadcast_upvote(room_id, question_id)
            return {"message": "OK"}

    raise HTTPException(status_code=404, detail=f"Question {question_id} not found in room {room_id}")

@router.post("/clear_questions")
async def clear_questions(request:RoomRequest):
    room_id = request.roomId
    logger.info(f"/clear_questions for room {room_id}")

    if room_id not in websocket_manager.active_room:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    websocket_manager.questions[room_id] = []

    await websocket_manager._broad_cast_command(room_id, Command.CLEAR_QUESTIONS)

    return {"message": "OK"}


@router.post("/new_round")
async def new_round(request: RoomRequest):
    room_id = request.roomId
    logger.info(f"/new_round for room {room_id}")

    if room_id not in websocket_manager.active_room:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    # Reset questions and messages
    websocket_manager.questions[room_id] = []
    websocket_manager.messages[room_id] = []

    await websocket_manager._broad_cast_command(room_id, Command.NEW_ROUND)

    return {"message": "OK"}

@router.post("/close_room")
async def close_room(request: RoomRequest):
    room_id = request.roomId

    logger.info(f"Broadcasting to users that room is closed")
    await websocket_manager._broad_cast_command(room_id, Command.CLOSE_ROOM)

    if room_id not in websocket_manager.active_room:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    # Disconnect all users in the room
    for user_id in websocket_manager.active_room[room_id]:
        await websocket_manager.leave_room(room_id, user_id)

    # Delete everything related to roomId
    del websocket_manager.active_room[room_id]
    del websocket_manager.messages[room_id]
    del websocket_manager.questions[room_id]

    logger.info(f"Closed room {room_id} and deleted all related data, and broadcasted to all users")

    return {"message": "OK"}
