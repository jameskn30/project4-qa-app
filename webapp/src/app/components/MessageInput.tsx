'use client'
import React, { useState } from 'react';
import { FaPaperPlane } from "react-icons/fa6";
import { Input } from "@/components/ui/input"


interface MessageInputProps {
    onSent: (message: string) => void;
}

const MessageInput = ({onSent} : MessageInputProps) => {
    const [message, setMessage] = useState('');

    const handleOnChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
    }

    const handleOnSend = () => {
        onSent(message)
        setMessage('')
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleOnSend();
        }
    }

    return (
        <div className="p-4 border-t border-gray-300 flex gap-2 items-center justify-stretch">
            <button 
                onClick={handleOnSend} 
                className="p-3 text-white rounded-md
                hover:ring-2
                focus:outline-none "
            >
                😊
            </button>
            <Input
                type="text"
                value={message}
                onChange={handleOnChangeMessage}
                onKeyDown={handleKeyDown}
                className="flex-1 p-1 border border-gray-300 text-sm
                rounded-lg focus:outline-none focus:ring-2 "
                placeholder="Type your message..."
            />
            <button 
                onClick={handleOnSend} 
                className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-700
                 focus:outline-none"
            >
                <FaPaperPlane/>
            </button>
        </div>
    )
}

export default MessageInput