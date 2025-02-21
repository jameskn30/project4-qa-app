'use client'
import {useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import _ from 'lodash'

export type Message = {
  username: string;
  content: string;
  flag: string;
}

const MessageListItem = ({ username, content, flag }: Message) => {
  if (username === 'system')
    return (
      <div className="relative mb-1 px-2 text-sm flex items-center justify-center">
        <p className="text-gray-700 text-sm">{content}</p>
      </div>
    )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative mb-1 px-2 text-sm flex items-center hover:bg-slate-200 hover:cursor-pointer">
          <div className="flex-1">
            <strong className="text-purple-700">{username}</strong> <span className="ml-1">{flag}</span> <span className="text-gray-700">{content}</span>
          </div>
        </div>
      </PopoverTrigger>
    </Popover>
  );
};

interface ChatWindowProps {
  messages: Message[],
  onSent: (message: string) => void
  questionsLeft: number
  upvoteLeft: number
  isHost: boolean
}

const ChatWindow = ({ messages, onSent, questionsLeft, upvoteLeft, isHost }: ChatWindowProps) => {

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white relative mb-12 ">
      <Toaster expand={true} position='top-center' richColors />
      <div className={`flex-1 overflow-y-auto flex flex-col pt-5 border border-slate-200`}>
        {
          messages &&
          messages.map((msg, index) => (
            <MessageListItem key={index} username={msg.username} content={msg.content} flag={msg.flag} />
          ))
        }
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;