'use client'

import { useState, useCallback, useEffect, useRef } from 'react';
import MessageInput from '@/app/components/MessageInput'
import { Toaster, toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const MessageListItem = ({ username, content, flag }: { username: string; content: string; flag: string }) => {
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
          <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center mr-2 shadow-md">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <strong className="text-purple-700">{username}</strong> <span className="ml-1">{flag}</span> <span className="text-gray-700">{content}</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-auto">
        <button className="rounded-md p-1 hover:bg-gray-200">👍</button>
        <button className="rounded-md p-1 hover:bg-gray-200">❤️</button>
        <button className="rounded-md p-1 hover:bg-gray-200">👏</button>
        <button className="rounded-md p-1 hover:bg-gray-200">😂</button>
      </PopoverContent>
    </Popover>
  );
};

type Message = {
  username: string;
  content: string;
  flag: string;
}

const ChatWindow = () => {

  // const randomMessages = genRandomMessages()
  const roomId = '1'; // test room id = 1

  const wsRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = useCallback(async () => {
    const response = await fetch(`/api/chat?roomId=${roomId}`);
    const data = await response.json();

    const ws = new WebSocket(data.websocketUrl);

    wsRef.current = ws

    console.log('open web socket')

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data)
      console.log(parsedData)
      const content = parsedData.message
      const username = parsedData.username

      const message: Message = { username, content, flag: '🇺🇸' };

      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error("WebSocket error: " + error, )
    };

    return () => {
      ws.close();
    };
  }, [roomId]);


  const onSent = (message: string) => {
    console.log('sending message')
    if (message !== ''){
      wsRef.current?.send(message)
    }
  }

  useEffect(() => {
    const cleanup = connectWebSocket();

    // getRoomMembers()

    return () => {
      cleanup.then((close) => close && close());
    };
  }, [connectWebSocket]);


  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
      <Toaster expand={true} position='top-center' richColors/>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {messages.map((msg, index) => (
          <MessageListItem key={index} username={msg.username} content={msg.content} flag={msg.flag} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSent={onSent} />
      <div className="border-t border-gray-300"></div>
    </div>
  );
};

export default ChatWindow;