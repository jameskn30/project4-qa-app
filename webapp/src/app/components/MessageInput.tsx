'use client'
import React, { useState } from 'react';

interface MessageInputProps {
    onSent: (message: string) => void;
}

const MessageInput = ({onSent} : MessageInputProps) => {
    const [message, setMessage] = useState('');

    const handleOnChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
        console.log()
    }

    const handleOnSend = (e: React.MouseEvent<HTMLButtonElement>) => {
        onSent(message)
        setMessage('')
    }

    return (
        <div className="p-4 border-t border-gray-300 flex bg-green-200">
            <input
                type="text"
                value={message}
                onChange={handleOnChangeMessage}
                className="flex-1 p-2 border border-gray-300 rounded-l"
                placeholder="Type your message..."
            />
            <button onClick={handleOnSend} className="p-2 bg-green-500 text-white rounded-r">Send</button>
        </div>
    )
}

export default MessageInput