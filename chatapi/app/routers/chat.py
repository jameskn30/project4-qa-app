from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
from pydantic import BaseModel
from uuid import uuid4
import random
import string
from redis.asyncio import Redis
import json
import os
from supabase import create_client, Client

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

#===

# utils
def gen_random_user_id():
    return str(uuid4())

def gen_random_username(length: int = 2) -> str:
    adjectives = ["Quick", "Lazy", "Happy", "Sad", "Bright", "Dark", "Clever", "Brave"]
    nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear", "Lion", "Tiger", "Wolf"]
    
    adjective = random.choice(adjectives)
    noun = random.choice(nouns)
    number = '_'.join(random.choices(string.digits, k=length))
    
    return f"{adjective} {noun} {number}"

def gen_random_phrase() -> str:
    adjectives = ["Quick", "Lazy", "Happy", "Sad", "Bright", "Dark", "Clever", "Brave"]
    nouns = ["Cat", "Dog", "Fox", "Bear", "Lion", "Tiger", "Wolf", "Mouse", "Deer", "Frog", "Fish", "Bird", "Ant", "Bee", "Duck", "Goat", "Hawk", "Lamb", "Mole", "Owl"]
    return f"{random.choice(adjectives).lower()} {random.choice(nouns).lower()} {random.randint(0,9)}{random.randint(0,9)}"

@dataclass
class UserConnection:
    user_id: str
    username: str
    user_host: str = ""
    websocket: WebSocket = None

# WEB SOCKET

class WebSocketManager:
    def __init__(self):
        self.active_room: Dict[str, List[str]] = {}
        self.user_id_to_conn: Dict[str, UserConnection] = {}
        self.user_id_to_room: Dict[str, str] = {}

        #Test data for development
        self.active_room['test room 10'] = []
    
    def _is_username_unique(self, room_id: str, username: str) -> bool:
        for user_id in self.active_room[room_id]:
            if self.user_id_to_conn[user_id].username == username:
                return False
        return True
    
    async def join_room(self, room_id: str, websocket: WebSocket, user_id: str = None, username: str = None):
        logger.info(f"Attempting to join room {room_id} with user_id {user_id} and username {username}")
        await websocket.accept()

        user_conn = UserConnection(
            user_id=user_id if user_id else gen_random_user_id(),
            websocket=websocket, 
            username=username if username else gen_random_username(),
            user_host=websocket.client.host
        )

        user_id = user_conn.user_id

        self.user_id_to_conn[user_id] = user_conn

        if room_id not in self.active_room:
            self.active_room[room_id] = []

        self.active_room[room_id].append(user_id)
        self.user_id_to_room[user_id] = room_id
        # self.room_to_username[room_id].add(username)  # Add username to set

        logger.info(f'User {user_id}:{websocket.client.host} joined room {room_id}')
        return user_id
    
    async def leave_room(self, room_id: str, user_id: str):
        logger.info(f"Attempting to leave room {room_id} with user_id {user_id}")
        if user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            username = user_conn.username

            #perform clean up for rooms and userid
            self.active_room[room_id].remove(user_id)
            # self.room_to_username[room_id].remove(username)
            del self.user_id_to_conn[user_id]
            del self.user_id_to_room[user_id]

            logger.info(f'User {user_id} left room {room_id}')
            await self._broadcast_redis_system(room_id, f'User {username} left the room')
            
        else:
            logger.error(f'User {user_id} not found in room {room_id}')
            raise AssertionError(f'User {user_id} not found in room {room_id}')
    
    async def send_group_message(self, user_id: str, message: str):
        logger.info(f"Sending group message from user_id {user_id}: {message}")
        room_id = self.user_id_to_room[user_id]
        username = self.user_id_to_conn[user_id].username
        # await self._broadcast(room_id, message, username)
        await self._broadcast_redis(room_id, message, username)

    async def notify_new_member(self, user_id: str, room_id: str):
        logger.info(f"Notifying new member {user_id} in room {room_id}")
        username = self.user_id_to_conn[user_id].username
        await self._broadcast_redis_system(room_id, f'{username} just joined')

    async def _broadcast_redis(self, room_id: str, message: str, username: str):
        data = {'message': message, 'username': username}
        logger.info(f"Broadcasting message with redis pubsub in room {room_id} from {username}: {message}")
        await redis_client.publish(f"chat:{room_id}", json.dumps(data))

    async def _broadcast_redis_system(self, room_id: str, message: str):
        data = {'message': message, 'username': 'system'}
        logger.info(f"Broadcast room {room_id} from system: {message}")
        await redis_client.publish(f"chat:{room_id}", json.dumps(data))

    async def _broadcast(self, room_id: str, message: str, username: str):
        logger.info(f"Broadcasting message in room {room_id} from {username}: {message}")
        for user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            await user_conn.websocket.send_json({'message': message, 'username': username})
    
    def get_user_conn(self, user_id):
        return self.user_id_to_conn.get(user_id)

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

# Suggestions:
# 1. Ensure `websocket.client.host` is unique for each user. If multiple users share the same host, it could cause issues.
# 2. Consider adding error handling for cases where `websocket.client.host` is not found in `user_id_to_room`.
# 3. Optimize the `leave_room` method to handle cases where the room is empty after a user leaves.
# 4. Add more logging for debugging purposes, especially in error cases.
# 5. Ensure that `user_id_to_conn` and `user_id_to_room` are properly cleaned up to avoid memory leaks.
