'use client'
import { useEffect, useRef, useState  } from 'react';
import { Toaster } from 'sonner';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { MessageCircleMore, User } from 'lucide-react'
import _ from 'lodash'
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
// import { ParticipantsList } from './ParticipantsList'

export type Message = {
  username: string;
  content: string;
}

const MessageListItem = ({ username, content }: Message) => {
  if (username === 'system')
    return (
      <div className="relative mb-1 px-2 text-sm flex items-center justify-center">
        <p className="text-gray-700 text-sm">{content}</p>
      </div>
    )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative mb-1 px-2 text-sm flex items-center hover:bg-slate-100 hover:cursor-pointer rounded-lg">
          <div className="flex-1">
            <strong className="text-purple-600">{username}</strong> <span className="text-gray-700">{content}</span>
          </div>
        </div>
      </PopoverTrigger>
    </Popover>
  );
};

interface ChatWindowProps {
  messages: Message[],
  participants: {username: string, isHost: boolean, online: boolean}[],
}

type Participant = {
  username: string;
  isHost?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  return (
    <div className="space-y-2">
      {participants.map((participant, index) => (
        <div key={index} className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg text-sm">
          <User className="h-5 w-5" />
          <span>{participant.username}</span>
          {participant.isHost && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Host</span>
          )}
        </div>
      ))}
    </div>
  )
}


const ChatWindow = ({ messages, participants}: ChatWindowProps) => {

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  return (
    <Card className="flex flex-col h-full overflow-y-auto bg-white relative rounded-2xl p-2">
      <Toaster expand={true} position='top-center' richColors />
      <Tabs defaultValue="messages" className="flex flex-col flex-1">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="messages">
            <MessageCircleMore className="mr-2 h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="participants">
            <User className="mr-2 h-4 w-4" />
            Participants ({participants.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="flex-1 overflow-y-auto">
          <div className="flex flex-col pt-5">
            {messages?.map((msg, index) => (
              <MessageListItem key={index} {...msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </TabsContent>
        <TabsContent value="participants" className="flex-1 overflow-y-auto pt-5">
          <ParticipantsList participants={participants} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChatWindow;