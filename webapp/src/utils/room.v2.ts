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

interface Message {
    content: string;
    guest_name: string;
    created_at: string;
}

interface Room {
    id: string;
    name: string;
    isHost: boolean;
}

interface RoomSummary {
    name: string;
    is_active: boolean;
    created_at: string;
}

// Helper functions
const _getUserData = async (client: SupabaseClient | null = null) => {
    const supabase = client || await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        if (error) console.error('Auth error:', error);
        throw new Error('Failed to fetch user data');
    }

    return user;
};

// Room management functions
export const createRoom = async (roomName: string): Promise<void> => {
    console.log('createRoom');
    const supabase = await createClient();
    
    try {
        // Get current user data
        const user = await _getUserData(supabase);
        
        // Create the room
        const { error } = await supabase
            .from('Room')
            .insert({
                name: roomName,
                host_id: user.id,
                is_active: true
            });
            
        if (error) {
            console.error('Error creating room:', error);
            throw new Error('Failed to create room');
        }
    } catch (error) {
        console.error('Error in createRoom:', error);
        throw error;
    }
};

export const fetchRoom = async (roomName: string): Promise<Room> => {
    const supabase = await createClient();
    let user = null;
    
    try {
        user = await _getUserData(supabase);
    } catch (err) {
        console.log('User not signed in');
    }

    const { data, error } = await supabase
        .from('Room')
        .select('id, host_id, created_at, name, is_active')
        .eq('name', roomName)
        .eq('is_active', 'TRUE')
        .single();

    if (error || !data) {
        console.error('Error checking room:', error);
        throw new Error('Room does not exist');
    }

    return { 
        name: data.name, 
        isHost: data?.host_id === user?.id, 
        id: data.id 
    };
};

export const closeRoom = async (roomId: string): Promise<void> => {
    const supabase = await createClient();

    const { error } = await supabase
        .from('Room')
        .update({ is_active: false }) // Changed from true to false to actually close the room
        .eq('id', roomId);

    if (error) {
        console.error('Error closing room:', error);
        throw new Error('Failed to close room');
    }
};

export const fetchMyRooms = async (): Promise<RoomSummary[]> => {
    const supabase = await createClient();
    
    try {
        const userData = await _getUserData(supabase);
        
        const { data, error } = await supabase
            .from('Room')
            .select('name, is_active, created_at')
            .eq('host_id', userData.id);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw new Error('Failed to fetch rooms');
    }
};

export const addMessage = async (
    roomId: string, 
    message: string, 
    guestName: string, 
    round: number
): Promise<void> => {
    const supabase = await createClient();

    const { error } = await supabase.from('Message')
        .insert({
            room_id: roomId,
            guest_name: guestName,
            content: message,
            round: round
        });

    if (error) {
        console.error('Error adding message:', error);
        throw new Error('Failed to add message');
    }
};

export const fetchMessages = async (roomId: string): Promise<Message[]> => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('Message')
        .select('content, guest_name, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        throw new Error('Failed to fetch messages');
    }

    return data || [];
};

export const groupMessages = async (messages: string[]): Promise<any> => {
    if (!CHATAPI_ENDPOINT) {
        throw new Error('Chat API endpoint not configured');
    }
    
    try {
        const res = await fetch(`${CHATAPI_ENDPOINT}/group_messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });
        
        if (!res.ok) {
            throw new Error(`API returned status ${res.status}`);
        }
        
        return res.json();
    } catch (error) {
        console.error('Error grouping messages:', error);
        throw new Error('Failed to group messages');
    }
};

export const insertQuestions = async (
    roomId: string, 
    questions: ProcessedQuestion[], 
    round: number
): Promise<any> => {
    const supabase = await createClient();

    try {
        // First delete existing questions for this room and round
        await supabase
            .from('ProcessedQuestions')
            .delete()
            .eq('room_id', roomId)
            .eq('round', round);

        // Then insert new questions
        const { data, error } = await supabase
            .from('ProcessedQuestions')
            .insert({
                room_id: roomId,
                round: round,
                questions: questions
            })
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving processed questions:', error);
        throw new Error(`Failed to save processed questions: ${error.message}`);
    }
};

export const fetchQuestions = async (
    roomId: string, 
    round: number
): Promise<ProcessedQuestion[]> => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('ProcessedQuestions')
        .select('questions')
        .eq('room_id', roomId)
        .eq('round', round)
        .maybeSingle();

    if (error) {
        console.error('Error fetching questions:', error);
        throw new Error('Failed to fetch questions');
    }

    return data?.questions || [];
};

export const clearQuestions = async (roomId: string, round: number): Promise<void> => {
    const supabase = await createClient();

    const { error } = await supabase
        .from('ProcessedQuestions')
        .delete()
        .eq('room_id', roomId)
        .eq('round', round);

    if (error) {
        console.error('Error clearing questions:', error);
        throw new Error('Failed to clear questions');
    }
};

export const submitFeedback = async (formData: FormData): Promise<{ success: boolean } | void> => {
    const feedback = formData.get("feedback") as string;
    const roomId = formData.get("roomId") as string;
    const isLiked = formData.get("like") === 'on';
    const phoneNumber = formData.get("phone") as string;
    const email = formData.get("email") as string;

    if (feedback.trim() === '' && !isLiked) {
        return;
    }

    const supabase = await createClient();
    let user = null;

    try {
        user = await _getUserData(supabase);
    } catch (error) {
        // Continue without user ID if not authenticated
    }

    try {
        const { error } = await supabase
            .from('Feedback')
            .insert({
                user_id: user ? user.id : null,
                feedback: feedback,
                like: isLiked,
                room_id: roomId,
                phone_number: phoneNumber,
                email: email
            });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw new Error('Failed to submit feedback');
    }
};

export const fetchFeedback = async (roomName: string): Promise<any> => {
    const supabase = await createClient();
    
    try {
        const user = await _getUserData(supabase);
        
        // First find all room IDs with the given name that belong to the current user
        const { data: roomData, error: roomsError } = await supabase
            .from('Room')
            .select('id')
            .eq('name', roomName)
            .eq('host_id', user.id)
            .maybeSingle()
            
        if (roomsError || !roomData) {
            console.error('Error finding rooms:', roomsError);
            throw new Error('Room not found or you do not have access to it');
        }
        
        // Extract all room IDs
        // const roomIds = roomsData.map(room => room.id);
        
        // Now query feedback for those rooms
        console.log('room data ', roomData)
        const roomId = roomData.id
        console.log('room id  ', roomId)

        const { data, error } = await supabase
            .from('Feedback')
            .select('feedback, like, username, phone_number, email')
            .eq('room_id', roomId)
        
        console.log('data ', data)  
            
        if (error) {
            console.error('Error fetching feedback:', error);
            throw new Error('Failed to fetch feedback');
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in fetchFeedback:', error);
        throw new Error('Failed to fetch feedback');
    }
}