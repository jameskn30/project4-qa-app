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

export const groupMessages = async (roomId: string) => {
    return fetch(`/chatapi/group_messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });
}

export const clearQuestions = async (roomId: string) => {
    return fetch(`/chatapi/clear_questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });
}


export const upvoteMessage = async (roomId: string, questionId: string, username: string) => {
    return fetch(`/chatapi/upvote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            roomId: roomId ,
            questionId: questionId,
            username: username
        }),
    });
}

export const newRound = async (roomId: string) => {
    return fetch(`/chatapi/new_round`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId }),
    });
}
