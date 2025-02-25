'use server'
import { createClient } from "@/utils/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache"
import { hasUncaughtExceptionCaptureCallback } from "process";

const CHATAPI_ENDPOINT = process.env.CHATAPI_ENDPOINT;

// export const isRoomExists = async (roomId: string) => {
//     const res = await fetch(`${CHATAPI_ENDPOINT}/room_exists`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ roomId: roomId }),
//     });

//     return res.ok
// }

const _getUserData = async (client: SupabaseClient|null  = null) => {
    let supabase
    if (client){
        supabase = client
    } else {
        supabase = await createClient()
    }

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
    console.log(userId)
    const res = await fetch(`${CHATAPI_ENDPOINT}/get_active_room/${userId}`);

    if (!res.ok) {
        return null
    } else {
        return res.json()
    }
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

export const groupMessages = async (messages: string[]) => {

    const res = await fetch(`${CHATAPI_ENDPOINT}/group_messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messages}),
    });

    return res.json()
}

export const clearQuestions = async (roomId: string) => {
    const res = await fetch(`${CHATAPI_ENDPOINT}/clear_questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });

    return res.json()
}

export const upvoteMessage = async (roomId: string, questionId: string) => {
    const res = await fetch(`${CHATAPI_ENDPOINT}/upvote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            roomId: roomId,
            questionId: questionId,
            username: ''
        }),
    });

    return res.json()
}

export const newRound = async (roomId: string) => {
    const res = await fetch(`${CHATAPI_ENDPOINT}/new_round`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });

    return res.json()
}

export const closeRoom = async (roomId: string) => {
    const res = await fetch(`${CHATAPI_ENDPOINT}/close_room`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });
    return res.json()
}

export const fetchRoom = async (roomName: string) => {
    const supabase = await createClient()
    let user = null
    try{
        user = await _getUserData()
    } catch(err){
        console.log('user not signed in')
    }
    
    const { data, error } = await supabase
        .from('Room')
        .select('id, hostId, created_at, name, is_active')
        .eq('name', roomName)
        .eq('is_active', 'TRUE')
        .single()
    
    if (error) {
        console.error('Error checking room:', error)
        throw new Error('Room does not exist')
    }
    
    return {'name': data.name, 'isHost': data?.hostId === user?.id, 'id': data.id}
}

export const fetchMessages = async (roomId: string) => {

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Message')
        .select('content, guestName, created_at')
        .eq('roomId', roomId)
        .order('created_at', { ascending: true })
    
    console.log('messsages from room ', roomId)
    console.log(data)
    
    if (error) {
        console.error('Error fetching messages:', error)
        throw new Error('Failed to fetch messages')
    }   
    return data
}
