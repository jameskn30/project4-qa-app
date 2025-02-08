'use client'
import { useState, useCallback, useEffect, useRef } from 'react';
import MessageInput from '@/app/components/MessageInput'
import { Toaster, toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useRoomContext } from '@/app/room/[roomId]/RoomContext'
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input'
import './ChatWindow.css'; // Import the CSS file for animations
import _ from 'lodash'
import { generateRandomUsername } from '@/utils/common';

type Message = {
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
          <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center mr-2 shadow-md">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <strong className="text-purple-700">{username}</strong> <span className="ml-1">{flag}</span> <span className="text-gray-700">{content}</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-auto">
        <button className="rounded-md p-1 hover:bg-gray-200">☝️</button>
        <button className="rounded-md p-1 hover:bg-gray-200">👎️️</button>
      </PopoverContent>
    </Popover>
  );
};

const ChatWindow = () => {
  const params = useParams<{ roomId: string }>()
  const roomId = params?.roomId
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>(generateRandomUsername());
  const [usernameInput, setUsernameInput] = useState<string>(username);
  const [showDialog, setShowDialog] = useState(true);
  const [shake, setShake] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { command, setCommand } = useRoomContext()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (command === 'leave') {
      wsRef.current?.close();
      setCommand(null);
      router.push("/")
    }
  }, [command])

  const connectWebSocket = useCallback(async () => {
    if (username === null) {
      toast.error('Internal error')
      return
    }

    const response = await fetch(`/api/chat?roomId=${roomId}&username=${username}`);
    const data = await response.json();
    const ws = new WebSocket(data.websocketUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      toast.success("Joined room")
    };

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      const content = parsedData.message;
      const username = parsedData.username;
      const message: Message = { username, content, flag: '🇺🇸' };
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error("Error while connecting to room");
    };

    return () => {
      ws.close();
    };
  }, [roomId, username]);

  const onSent = (message: string) => {
    if (message !== '') {
      wsRef.current?.send(message)
    }
  }

  useEffect(() => {
    if (username && !showDialog) {
      const cleanup = connectWebSocket();
      return () => {
        cleanup.then((close) => close && close());
      };
    }
  }, [connectWebSocket, username, showDialog]);


  const isUsernameUnique = _.debounce(async (usernameData: string) => {
    const response = await fetch('/chatapi/is_username_unique', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomId: roomId, username: usernameData })
    })

    if (response.ok) {
      console.log('setting username = ' + usernameData)
      setUsername(usernameData);
      setShowDialog(false);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(`Name: ${username} already taken`)
    }
  }, 1000);

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget)
    const usernameData = formData.get('username') as string;
    console.log('username data = ' + usernameData)

    isUsernameUnique(usernameData);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white relative">
      <Toaster expand={true} position='top-center' richColors />
      <div className={`flex-1 overflow-y-auto flex flex-col ${showDialog ? 'blur-sm' : ''}`}>
        {messages.map((msg, index) => (
          <MessageListItem key={index} username={msg.username} content={msg.content} flag={msg.flag} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSent={onSent} />
      <div className="border-t border-gray-300"></div>

      {showDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 backdrop-blur-sm">
          <form onSubmit={handleUsernameSubmit} className={`bg-white p-6 rounded-xl shadow-lg border-2 boder-slate-100 ${shake ? 'shake' : ''}`}>
            <label className="block text-sm font-medium text-gray-700">What's your name? ☺️ </label>
            <Input type="text" id="username" name="username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
            <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;