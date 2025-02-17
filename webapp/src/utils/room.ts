export const isRoomExists = async (roomId: string) => {
    const response = await fetch('/chatapi/room_exists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });

    if (response.ok){
        return true
    }
    return false
}

export const createRoom = async (roomId: string) => {
    const response = await fetch('/chatapi/create_room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });

    if (response.ok) {
        return true;
    }
    return false
}

export const syncRoom = async (roomId: string) => {
    return fetch(`/chatapi/sync_room/${roomId}`);
}

