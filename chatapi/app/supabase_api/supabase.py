from supabase import create_client, Client
from typing import List
import uuid

SUPABASE_URL = "https://dypuleqmsczlryhqbuoo.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHVsZXFtc2N6bHJ5aHFidW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTI5MTAwMiwiZXhwIjoyMDU0ODY3MDAyfQ.UxNaQoLzNsspeVWPBRsbAntWKttBTHJMKWtpQt3d0EU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# def fetch_rooms() -> List:
#     response = supabase.table("Room").select("*").execute()
#     if response.data:
#         return response.data
#     return []

# def fetch_guests_by_room_id(room_id: str) -> List:
#     try:
#         uuid.UUID(room_id)  # Validate if room_id is a valid UUID
#     except ValueError:
#         raise ValueError(f"Invalid room_id: {room_id}")

#     response = supabase.table("Guest").select(
#         "*").eq("roomId", room_id).execute()
#     if response.data:
#         return response.data
#     return []


# def fetch_room_by_name(name: str) -> List:
#     response = supabase.table("Room").select("*").eq("name", name).execute()
#     if response.data:
#         return response.data
#     return []


# def fetch_room_by_userid(user_id: str) -> List:
#     try:
#         uuid.UUID(user_id)  # Validate if room_id is a valid UUID
#     except ValueError:
#         raise ValueError(f"Invalid room_id: {user_id}")

#     response = supabase.table("Room").select(
#         "*").eq("hostId", user_id).execute()
#     if response.data:
#         return response.data
#     return []


# def fetch_room_messages_by_room_id(room_id: str):

#     try:
#         uuid.UUID(room_id)  # Validate if room_id is a valid UUID
#     except ValueError:
#         raise ValueError(f"Invalid room_id: {room_id}")

#     response = supabase.table("RoomMessages").select(
#         "*").eq('roomId', room_id).execute()
#     if response.data:
#         return response.data
#     return []


# def update_room_messages_by_room_id(room_id: str, new_message: List[str]):

#     try:
#         uuid.UUID(room_id)  # Validate if room_id is a valid UUID
#     except ValueError:
#         raise ValueError(f"Invalid room_id: {room_id}")

#     supabase.rpc(
#         "update_room_messages", {
#             "room_id": room_id,
#             "new_message": new_message
#         }).execute()
    
def create_room_by_host_id(host_id: str, room_name: str):
    try:
        uuid.UUID(host_id)  # Validate if host_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid host_id: {host_id}")

    response = supabase.table("Room").insert([
        {"hostId": host_id, "name": room_name, 'is_active': 'TRUE'}
    ]).execute()

    return response

def fetch_active_room_name_by_userid(user_id: str) -> str:
    """
    Fetch active room name for a given user ID.
    Returns None if no active room is found.
    """
    try:
        uuid.UUID(user_id)  # Validate if user_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid user_id: {user_id}")

    print('user id = ' + user_id)
    response = supabase.table("Room").select("name").eq("hostId", user_id).eq('is_active', 'TRUE').execute()
    if response.data and len(response.data) > 0:
        return response.data[0]["name"]

    return None

def add_participant_to_room(room_id, user_id, username):
    try:
        uuid.UUID(room_id)  # Validate if room_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid room_id: {room_id}")

    try:
        uuid.UUID(user_id)  # Validate if user_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid user_id: {user_id}")

    response = supabase.table("Guest").insert([
        {"roomId": room_id, "userId": user_id, "username": username}
    ]).execute()
    return response

def remove_participant_from_room(room_id, username):
    try:
        uuid.UUID(room_id)  # Validate if room_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid room_id: {room_id}")

    response = supabase.table("Guest").delete().eq("name", username).execute()
    return response

def delete_room(room_id, user_id):
    try:
        uuid.UUID(room_id)  # Validate if room_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid room_id: {room_id}")

    try:
        uuid.UUID(user_id)  # Validate if user_id is a valid UUID
    except ValueError:
        raise ValueError(f"Invalid user_id: {user_id}")

    response = supabase.table("Room").delete().eq("id", room_id).eq("hostId", user_id).execute()
    return response


if __name__ == '__main__':
    pass
    # active_room = update_room_messages_by_room_id('a3cba451-61fd-488f-8e9f-a5a654ff2620', new_message)
    # print(active_room)
    
    # new_messsage = new_message = [{ "content" : "This is an appended message 456" , "senderUsername" : "user6" , "createdAt" : "2025-02-14T11:00:00Z" }]
    # print(new_message)

    # update_room_messages_by_room_id('a3cba451-61fd-488f-8e9f-a5a654ff2620', new_message)
    # print('OK ')

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
