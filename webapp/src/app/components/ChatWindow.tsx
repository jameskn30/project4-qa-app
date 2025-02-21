'use client'
import {useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {MessageCircleMore, User} from 'lucide-react'
import _ from 'lodash'
import { Card } from '@/components/ui/card';

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
    <Card className="flex flex-col h-full overflow-y-auto bg-white relative rounded-2xl p-2">
      <Toaster expand={true} position='top-center' richColors />
      <div className="w-full justify-center gap-2 flex items-center">
        <Button variant="outline" className="flex-1"><MessageCircleMore/> Chat</Button>
        <Button variant="outline" className="flex-1"><User/> Participants (36)</Button>
      </div>
      <div className={`flex-1 overflow-y-auto flex flex-col pt-5 `}>
        {
          messages &&
          messages.map((msg, index) => (
            <MessageListItem key={index} username={msg.username} content={msg.content} flag={msg.flag} />
          ))
        }
        <div ref={messagesEndRef} />
      </div>
    </Card>
  );
};

export default ChatWindow;