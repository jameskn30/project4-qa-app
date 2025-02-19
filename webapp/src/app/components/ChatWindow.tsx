'use client'
import { useState, useCallback, useEffect, useRef } from 'react';
import MessageInput from '@/app/components/MessageInput'
import { Toaster, toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useRoomContext } from '@/app/room/[roomId]/RoomContext'
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input'
import _ from 'lodash'
import { generateRandomUsername } from '@/utils/common';

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
      {/* <PopoverContent className="p-2 w-auto">
        <button className="rounded-md p-1 hover:bg-gray-200">☝️</button>
        <button className="rounded-md p-1 hover:bg-gray-200">👎️️</button>
      </PopoverContent> */}
    </Popover>
  );
};

interface ChatWindowProps {
  messages: Message[],
  onSent: (message: string) => void
  questionsLeft: number
  upvoteLeft: number
}

const ChatWindow = ({ messages, onSent, questionsLeft, upvoteLeft }: ChatWindowProps) => {

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white relative">
      <Toaster expand={true} position='top-center' richColors />
      <div className={`flex-1 overflow-y-auto flex flex-col pt-5`}>
        {
          messages &&
          messages.map((msg, index) => (
            <MessageListItem key={index} username={msg.username} content={msg.content} flag={msg.flag} />
          ))
        }

        <div ref={messagesEndRef} />
      </div>
      <div className="top-0 flex justify-center w-full backdrop-blur-sm p-2 gap-4 text-center">
        <div className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md">{questionsLeft} questions left</div>
        <div className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md">{upvoteLeft} upvotes left</div>
      </div>
      {
        (questionsLeft > 0) ?
          <MessageInput onSent={onSent} /> :
          <div className="bottom-0 w-full bg-white shadow-lg p-2">
            <p className="italic text-red-500">Everyone only allowed to ask 3 questions, wait until host restart Q&A round </p>
          </div>
      }
    </div>
  );
};

export default ChatWindow;