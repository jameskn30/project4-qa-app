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
        if(error) console.error(error)
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
