'use server'

// Third-party imports
import { SupabaseClient } from "@supabase/supabase-js";

// Local imports
import { createClient } from "@/utils/supabase/server";

// Constants
const CHATAPI_ENDPOINT = process.env.CHATAPI_ENDPOINT;

// Types
interface ProcessedQuestion {
    uuid: string;
    rephrase: string;
    upvotes: number;
}

// Helper functions
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

// Room management functions
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

export const fetchRoomId = async () => {
    const res = await fetch(`${CHATAPI_ENDPOINT}/get_random_room_id`);

    if (!res.ok) {
        throw new Error('Failed to fetch room ID');
    }

    return res.json();
}

export const closeRoom = async (roomId: string) => {
    const supabase = await createClient()

    console.log(roomId)

    const { error } = await supabase
        .from('Room')
        .update({ is_active: true })
        .eq('id', roomId)
        
    if (error) {
        console.error('Error closing room:', error)
        throw new Error('Failed to close room')
    }
}

export const fetchMyRooms = async () => {
    const supabase = await createClient()
    const userData = await _getUserData(supabase)

    const {data,error} = await supabase
        .from('Room')
        .select('name, is_active, created_at')
        .eq('host_id', userData.id)

    if (error) {    
        console.error('Error fetching rooms:', error)
        throw new Error('Failed to fetch rooms')
    }

    return data
}

export const addMessage = async (roomId: string, message: string, guestName: string, round: number) => {
    const supabase = await createClient()
    console.log("add message")
    console.log(round)
    

    const {data, error: insertError} = await supabase.from('Message')
        .insert({
            room_id: roomId,
            guest_name: guestName,
            content: message,
            round: round
        })
    
    if (insertError) {
        console.error('Error adding message', insertError)
        throw new Error('Failed to add message')
    }
}

//TODO: this is bulk insert
// export const addMessages = async (roomId: string, messages: {content:string , username:string }[]) => {
//     const supabase = await createClient()

//     const {data, error: insertError} = await supabase.from('Message')
//         .insert(messages.map((m) => ({
//             room_id: roomId,
//             content: m.content,
//             guest_name: m.username,
//         })))
    
//     if (insertError) {
//         console.error('Error adding messages:', insertError)
//         throw new Error('Failed to add messages')
//     }
// }

// Message and question handling
export const fetchMessages = async (roomId: string) => {

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Message')
        .select('content, guest_name, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        throw new Error('Failed to fetch messages')
    }
    return data
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
    console.log(roomId, ' ', round)
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

export const submitFeedback = async (formData: FormData) => {
    const feedback = formData.get("feedback") as string;
    const roomId = formData.get("roomId") as string;
    const isLiked = formData.get("like") === 'on';
    console.log(roomId)
    console.log(isLiked)
    if (feedback.trim() === '' && !isLiked) {
        return
    }

    const supabase = await createClient();

    const user = await _getUserData(supabase);
    
    try {
        const { error } = await supabase
            .from('Feedback')
            .insert({
                user_id: user ? user.id : null,
                feedback: feedback,
                like: isLiked,
                room_id: roomId
            });

        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw new Error('Failed to submit feedback');
    }
}
