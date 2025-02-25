'use server'
import { createClient } from "@/utils/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache"
import { hasUncaughtExceptionCaptureCallback } from "process";

const CHATAPI_ENDPOINT = process.env.CHATAPI_ENDPOINT;

const _getUserData = async (client: SupabaseClient | null = null) => {
    let supabase
    if (client) {
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

    return res.json();
}

export const groupMessages = async (messages: string[]) => {

    const res = await fetch(`${CHATAPI_ENDPOINT}/group_messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messages }),
    });

    return res.json()
}

// export const clearQuestions = async (roomId: string) => {
//     const res = await fetch(`${CHATAPI_ENDPOINT}/clear_questions`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ roomId: roomId }),
//     });

//     return res.json()
// }

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
    try {
        user = await _getUserData()
    } catch (err) {
        console.log('user not signed in')
    }

    const { data, error } = await supabase
        .from('Room')
        .select('id, host_id, created_at, name, is_active')
        .eq('name', roomName)
        .eq('is_active', 'TRUE')
        .single()

    if (error) {
        console.error('Error checking room:', error)
        throw new Error('Room does not exist')
    }

    return { 'name': data.name, 'isHost': data?.host_id === user?.id, 'id': data.id }
}

export const fetchMessages = async (roomId: string) => {

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Message')
        .select('content, guestName, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        throw new Error('Failed to fetch messages')
    }
    return data
}

interface ProcessedQuestion {
    uuid: string;
    rephrase: string;
    upvotes: number;
    downvotes: number;
}

export const insertQuestions = async (roomId: string, questions: ProcessedQuestion[], round: number) => {
    const supabase = await createClient()

    try {
        // First delete existing questions for this room and round
        const { error: deleteError } = await supabase
            .from('ProcessedQuestions')
            .delete()
            .eq('room_id', roomId)
            .eq('round', round)

        if (deleteError) throw deleteError

        // Then insert new questions
        const { data, error: insertError } = await supabase
            .from('ProcessedQuestions')
            .insert({
                room_id: roomId,
                round: round,
                questions: questions
            })
            .select()

        if (insertError) throw insertError
        return data

    } catch (error) {
        console.error('Error saving processed questions:', error)
        throw new Error(`Failed to save processed questions: ${error.message}`)
    }
}

export const fetchQuestions = async (roomId: string, round: number) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ProcessedQuestions')
        .select('questions')
        .eq('room_id', roomId)
        .eq('round', round)
        .single()

    if (error) {
        console.error('Error fetching questions:', error)
        throw new Error('Failed to fetch questions')
    }

    return data.questions
}

export const clearQuestions = async (roomId: string, round: number) => {
    const supabase = await createClient()
    console.log('Clearing questions for room', roomId, 'round', round)

    const { error: deleteError } = await supabase
        .from('ProcessedQuestions')
        .delete()
        .eq('room_id', roomId)
        .eq('round', round)
    

    if (deleteError) {
        console.error(deleteError)
        throw deleteError
    }
}