'use client'
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users } from 'lucide-react';
import { Participant } from '@/utils/realtime';

export interface Message {
  username: string;
  content: string;
  flag?: string;
}

interface ChatWindowProps {
  messages: Message[];
  participants?: Participant[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, participants = [] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="h-full flex flex-col overflow-hidden border rounded-xl shadow-sm">
      <CardHeader className="py-2 px-4 border-b flex justify-between items-center">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageCircle size={16} className="text-blue-500" />
          <span>Chat</span>
          {participants.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Users size={14} className="mr-1" />
              <span>{participants.length}</span>
            </div>
          )}
        </CardTitle>

      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="p-2 flex gap-2 flex-col">
          {messages.map((message, index) => {
            return (
              <p className="text-sm text-gray-700" key={index}>
                <span className='font-bold text-sm text-purple-600 me-2'>
                  {message.username}:
                </span>
                {message.content}
              </p>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {participants && participants.length > 0 && participants.length > 3 && (
        <div className="p-2 border-t text-xs flex items-center justify-end">
          <span className="text-gray-500">
            {participants.length} online
          </span>
        </div>
      )}
    </Card>
  );
};

export default ChatWindow;