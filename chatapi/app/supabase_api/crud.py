import os
from supabase import create_client, Client
from typing import List
import uuid
import json

SUPABASE_URL = "https://dypuleqmsczlryhqbuoo.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHVsZXFtc2N6bHJ5aHFidW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTI5MTAwMiwiZXhwIjoyMDU0ODY3MDAyfQ.UxNaQoLzNsspeVWPBRsbAntWKttBTHJMKWtpQt3d0EU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def fetch_rooms() -> List:
    response = supabase.table("Room").select("*").execute()
    if response.data:
        return response.data
    return []


def fetch_guests_by_room_id(room_id: str) -> List:
    try:
        uuid.UUID(room_id)  # Validate if room_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid room_id: {room_id}")

    response = supabase.table("Guest").select(
        "*").eq("roomId", room_id).execute()
    if response.data:
        return response.data
    return []


def fetch_room_by_name(name: str) -> List:
    response = supabase.table("Room").select("*").eq("name", name).execute()
    if response.data:
        return response.data
    return []


def fetch_room_by_userid(user_id: str) -> List:
    try:
        uuid.UUID(user_id)  # Validate if room_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid room_id: {user_id}")

    response = supabase.table("Room").select(
        "*").eq("hostId", user_id).execute()
    if response.data:
        return response.data
    return []


def fetch_room_messages_by_room_id(room_id: str):

    try:
        uuid.UUID(room_id)  # Validate if room_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid room_id: {room_id}")

    response = supabase.table("RoomMessages").select(
        "*").eq('roomId', room_id).execute()
    if response.data:
        return response.data
    return []


def update_room_messages_by_room_id(room_id: str, new_message: List[str]):

    try:
        uuid.UUID(room_id)  # Validate if room_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid room_id: {room_id}")

    supabase.rpc(
        "update_room_messages", {
            "room_id": room_id,
            "new_message": new_message
        }).execute()

if __name__ == '__main__':
    
    new_messsage = new_message = [{ "content" : "This is an appended message 456" , "senderUsername" : "user6" , "createdAt" : "2025-02-14T11:00:00Z" }]
    print(new_message)

    update_room_messages_by_room_id('a3cba451-61fd-488f-8e9f-a5a654ff2620', new_message)
    print('OK ')

    # print("fetch_room_messages_by_room_id")
    # try:
    #     res = fetch_room_messages_by_room_id(
    #         'a3cba451-61fd-488f-8e9f-a5a654ff26201')
    #     for row in res:
    #         print(row)
    # except ValueError as e:
    #     print(e)

    # print("fetch_rooms")
    # res = fetch_rooms()
    # for row in res:
    #     print(row)

    # print("fetch_guests")
    # res = fetch_guests_by_room_id('a3cba451-61fd-488f-8e9f-a5a654ff2620')
    # for row in res:
    #     print(row)

    # print("fetch_room_by_id")
    # res = fetch_room_by_name('test room 10')

    # for row in res:
    #     print(row)

    # print("fetch_room_by_userid")
    # res = fetch_room_by_userid('fee16e83-061c-4a48-bf09-ccce95dba1be')
    # if len(res) == 0: print('empty')
    # else:
    #     for row in res:
    #         print(row)
