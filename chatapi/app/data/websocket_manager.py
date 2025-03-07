import logging
from typing import List, Dict
from dataclasses import dataclass
from uuid import uuid4
import random
import string
from redis.asyncio import Redis
import json
from fastapi import WebSocket
import os
from enum import Enum
from supabase_api.supabase import  add_participant_to_room, remove_participant_from_room,create_room_by_host_id 

logger = logging.getLogger("chat")

def gen_random_user_id():
    return str(uuid4())


def gen_random_username(length: int = 2) -> str:
    adjectives = ["Quick", "Lazy", "Happy", "Sad",
                  "Bright", "Dark", "Clever", "Brave"]
    nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear", "Lion", "Tiger", "Wolf"]

    adjective = random.choice(adjectives)
    noun = random.choice(nouns)
    number = '_'.join(random.choices(string.digits, k=length))

    return f"{adjective} {noun} {number}"


def gen_random_phrase() -> str:
    adjectives = ["Quick", "Lazy", "Happy", "Sad",
                  "Bright", "Dark", "Clever", "Brave"]
    nouns = ["Cat", "Dog", "Fox", "Bear", "Lion", "Tiger", "Wolf", "Mouse", "Deer",
             "Frog", "Fish", "Bird", "Ant", "Bee", "Duck", "Goat", "Hawk", "Lamb", "Mole", "Owl"]
    return f"{random.choice(adjectives).lower()} {random.choice(nouns).lower()} {random.randint(0, 9)}{random.randint(0, 9)}"


@dataclass
class UserConnection:
    user_id: str
    username: str
    user_host: str = ""
    websocket: WebSocket = None


REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

redis_client = Redis.from_url(f"redis://{REDIS_HOST}:{REDIS_PORT}")


class Command(Enum):
    CLEAR_QUESTIONS = "clear_questions"
    GROUPING_QUESTIONS = "grouping_questions"
    NEW_ROUND = "new_round"
    CLOSE_ROOM = "close_room"


MOCK_MESSAGES = [
    "How do I reset my password?",
    "I forgot my password, how can I recover it?",
    "What is the process to change my password?",
    "Can you help me with my account recovery?",
    "How do I update my profile information?",
    "I need to change my email address on my account.",
    "What are the store hours for the weekend?",
    "Is the store open on holidays?",
    "Can I return an item without a receipt?",
    "What is the return policy for online purchases?",
    "How do I track my order?",
    "My order hasn't arrived yet, what should I do?",
    "Can I change the shipping address for my order?",
    "How do I apply for a job at your company?",
    "Are there any job openings in the marketing department?",
    "What benefits do you offer to employees?",
    "How do I schedule an appointment?",
    "Can I reschedule my appointment online?",
    "What documents do I need to bring to my appointment?",
    "How do I cancel my subscription?",
    "What are the subscription plans available?",
    "Can I upgrade my subscription plan?",
    "How do I contact customer support?",
    "Is there a live chat option for customer support?",
    "What is the phone number for customer support?",
    "How do I download the mobile app?",
    "Is the mobile app available for both iOS and Android?",
    "How do I report a bug in the mobile app?",
    "Can I use the mobile app to make payments?",
    "What payment methods are accepted?",
    "How do I add a new payment method?",
    "Can I set up automatic payments?",
    "How do I delete my account?",
    "What happens to my data if I delete my account?",
    "Can I reactivate my account after deleting it?",
    "How do I change my notification settings?",
    "Can I turn off email notifications?",
    "How do I enable push notifications?",
    "What is the privacy policy of your company?",
    "How do you handle customer data?",
    "What security measures are in place to protect my information?"
]


class WebSocketManager:

    def __init__(self):
        self.active_room: Dict[str, List[str]] = {}
        self.user_id_to_conn: Dict[str, UserConnection] = {}
        self.user_id_to_room: Dict[str, str] = {}
        self.messages: Dict[str, List[Dict[str, str]]] = {}
        self.questions: Dict[str, List[Dict[str, str]]] = {}
        self.room_to_host_id: Dict[str, str] = {}

        # Test data for development
        self._create_new_room('test room 10', '1', test=True)
        self.messages['test room 10'] = [
            {
                'uuid': id,
                "username": gen_random_username(),
                "content": msg
             } for id, msg in enumerate(MOCK_MESSAGES)]

        # end test setup

    def _check_if_user_is_host_of_room(self, room_id: str, user_id: str) -> bool:
        return self.room_to_host_id.get(room_id) == user_id

    def get_room_by_host_id(self, host_id: str) -> str:
        print(self.room_to_host_id)
        for room_id, room_host_id in self.room_to_host_id.items():
            if room_host_id == host_id:
                return room_id
        return None

    def _create_new_room(self, room_id: str, user_id: str, questions=[], messages=[], test = False):
        # test is for creating without update db on supabase
        self.active_room[room_id] = []
        self.room_to_host_id[room_id] = user_id
        self.questions[room_id] = questions
        self.messages[room_id] = messages

        if not test:
            create_room_by_host_id(user_id, room_id)

    def _close_room(self, room_id: str):
        del self.active_room[room_id]
        del self.room_to_host_id[room_id]
        del self.questions[room_id]
        del self.messages[room_id]

    def _is_username_unique(self, room_id: str, username: str) -> bool:
        for user_id in self.active_room[room_id]:
            if self.user_id_to_conn[user_id].username == username:
                return False
        return True

    async def join_room(self, room_id: str, websocket: WebSocket, user_id: str = None, username: str = None):
        logger.info(
            f"Attempting to join room {room_id} with user_id {user_id} and username {username}")
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
        logger.info(
            f'User {user_id}:{websocket.client.host} joined room {room_id}')
        
        # Update supabase
        add_participant_to_room(room_id, user_id, user_conn.username)

        return user_id

    async def leave_room(self, room_id: str, user_id: str):
        logger.info(
            f"Attempting to leave room {room_id} with user_id {user_id}")
        if user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            username = user_conn.username

            # perform clean up for rooms and userid
            self.active_room[room_id].remove(user_id)
            # self.room_to_username[room_id].remove(username)
            del self.user_id_to_conn[user_id]
            del self.user_id_to_room[user_id]

            logger.info(f'User {user_id} left room {room_id}')
            await self._broadcast_redis_system(room_id, f'User {username} left the room')

            # TODO: update supabase
            remove_participant_from_room(room_id, username)

        else:
            logger.error(f'User {user_id} not found in room {room_id}')
            raise AssertionError(f'User {user_id} not found in room {room_id}')
        

    async def send_group_message(self, user_id: str, message: str):
        logger.info(f"Sending group message from user_id {user_id}: {message}")
        room_id = self.user_id_to_room[user_id]
        username = self.user_id_to_conn[user_id].username
        self.messages[room_id].append(
            {"username": username, "content": message})

        await self._broadcast_redis(room_id, message, username)

    async def notify_new_member(self, user_id: str, room_id: str):
        logger.info(f"Notifying new member {user_id} in room {room_id}")
        username = self.user_id_to_conn[user_id].username
        await self._broadcast_redis_system(room_id, f'{username} just joined')

    async def _broadcast_redis(self, room_id: str, message: str, username: str):
        data = {'message': message, 'username': username, 'type': 'message'}
        logger.info(
            f"Broadcasting message with redis pubsub in room {room_id} from {username}: {message}")
        await redis_client.publish(f"chat:{room_id}", json.dumps(data))

    async def _broadcast_redis_system(self, room_id: str, message: str):
        data = {'message': message, 'username': 'system', 'type': 'message'}
        logger.info(f"Broadcast room {room_id} from system: {message}")
        await redis_client.publish(f"chat:{room_id}", json.dumps(data))

    async def _broadcast(self, room_id: str, message: str, username: str):
        data = {'message': message, 'username': username, 'type': 'message'}
        logger.info(
            f"Broadcasting message in room {room_id} from {username}: {message}")
        for user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            await user_conn.websocket.send_json(data)

    async def _broadcast_grouped_questions(self, room_id: str, questions: object, username: str):
        # TODO: check if username is HOST, only host allowed to do this
        data = {'questions': questions,
                'username': username, 'type': 'questions'}
        logger.info(
            f"Broadcasting questions in room {room_id}, #questions = {len(questions)}, # participants ={len(self.active_room[room_id])}")
        for user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            await user_conn.websocket.send_json(data)

    async def _broadcast_upvote(self, room_id: str, questionId: string):
        # TODO: check if username is HOST, only host allowed to do this
        data = {'questionId': questionId, 'type': 'upvote'}

        logger.info(
            f"Broadcasting upvate question {questionId} in room {room_id}")

        for user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            await user_conn.websocket.send_json(data)

    async def _broad_cast_command(self, room_id: str, command: Command):
        data = {'command': command.value, 'type': 'command'}
        logger.info(f"Broadcasting command {command.value} in room {room_id}")
        for user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            await user_conn.websocket.send_json(data)

    def get_user_conn(self, user_id):
        return self.user_id_to_conn.get(user_id)

    def _get_room_members(self, room_id: str) -> List[Dict[str, str]]:
        """Get list of all members in a room with their usernames and host status."""
        if room_id not in self.active_room:
            return []
        
        members = []
        host_id = self.room_to_host_id.get(room_id)
        
        for user_id in self.active_room[room_id]:
            user_conn = self.user_id_to_conn[user_id]
            members.append({
                "username": user_conn.username,
                "isHost": user_id == host_id
            })
        
        return members
    
