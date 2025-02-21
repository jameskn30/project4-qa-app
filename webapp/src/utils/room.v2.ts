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
