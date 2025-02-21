'use server'
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

const CHATAPI_ENDPOINT = process.env.CHATAPI_ENDPOINT;

export const isRoomExists = async (roomId: string) => {
    const res = await fetch(`${CHATAPI_ENDPOINT}/room_exists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });

    return res.ok
}

const _getUserData = async () => {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (user === null || error) {
        if (error) console.error(error)
        throw new Error('failed to fetch user data')
    }

    return user
}

export const getActiveRooms = async () => {
    const user = await _getUserData()
    const userId = user.id
    const res = await fetch(`${CHATAPI_ENDPOINT}/${userId}`);
    return res.json()
}

export const createRoom = async (roomId: string) => {
    const user = await _getUserData()
    const userId = user.id

    const response = await fetch(`${CHATAPI_ENDPOINT}/create_room`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            roomId: roomId,
            userId: userId
        }),
    });

    if (response.ok) {
        return true;
    }
    return false
}

export const fetchRoomId = async () => {
    const res = await fetch(`${CHATAPI_ENDPOINT}/get_random_room_id`);

    if (!res.ok) {
        throw new Error('Failed to fetch room ID');
    }
    console.log(res)

    return res.json();
}

export const amIHost = async (roomId: string) => {
    const user = await _getUserData()
    //TODO: remove this after testing
    // const userId = user.id
    const userId = '1'

    const queryParams = new URLSearchParams({
        roomId: roomId,
        userId: userId
    }).toString();

    const res = await fetch(`${CHATAPI_ENDPOINT}/am_i_host?${queryParams}`);
    return res.ok
}

export const syncRoom = async (roomId: string) => {
    return fetch(`${CHATAPI_ENDPOINT}/sync_room/${roomId}`);
}

export const getActiveRoomsByUserId = async (userId: string) => {
    return fetch(`${CHATAPI_ENDPOINT}/get_active_room/${userId}`);
}

export const groupMessages = async (roomId: string) => {

    const res = await fetch(`${CHATAPI_ENDPOINT}/group_messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });

    return res.json()
}

export const clearQuestions = async (roomId: string) => {
    return fetch(`${CHATAPI_ENDPOINT}/clear_questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });
}

export const upvoteMessage = async (roomId: string, questionId: string, username: string) => {
    return fetch(`${CHATAPI_ENDPOINT}/upvote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            roomId: roomId,
            questionId: questionId,
            username: username
        }),
    });
}

export const newRound = async (roomId: string) => {
    return fetch(`${CHATAPI_ENDPOINT}/new_round`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });
}

export const closeRoom = async (roomId: string) => {
    return fetch(`${CHATAPI_ENDPOINT}/close_room`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });
}
