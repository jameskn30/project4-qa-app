'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import { RoomProvider } from '@/app/room/[roomId]/RoomContext';
import { isRoomExists } from '@/utils/room';
import { useRouter, useParams } from 'next/navigation';
import Loading from './loading'
import ErrorPage from './error';
import { generateRandomMessages, generateRandomQuestions } from '@/app/utils/mock';
import { toast } from 'sonner';
import { generateRandomUsername } from '@/utils/common';
import { Message } from '@/app/components/ChatWindow';
import { QuestionItem } from '@/app/components/QuestionList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const RoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null;
  const [loading, setLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const [username, setUsername] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [showDialog, setShowDialog] = useState(true);
  const [messages, setMessages] = useState<Message[]>(generateRandomMessages(10));
  const [questions, setQuestions] = useState<QuestionItem[]>(generateRandomQuestions(10));

  useEffect(() => {
    setUsername(generateRandomUsername());
  }, []);

  useEffect(() => {
    const checkRoomExists = async () => {
      if (!roomId || !(await isRoomExists(roomId))) {
        console.log('room does not exist')
        setRoomExists(false);
        return;
      }
      setLoading(false);
    };

    checkRoomExists();
  }, [roomId]);

  const connectWebSocket = useCallback(async () => {
    if (username === null) {
      toast.error('Internal error');
      return;
    }

    console.log('Connecting to WebSocket...');
    const response = await fetch(`/api/chat?roomId=${roomId}&username=${username}`);
    const data = await response.json();
    const ws = new WebSocket(data.websocketUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      toast.success("Joined room");
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
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

  useEffect(() => {
    if (!loading && username && roomExists && !showDialog) {
      const cleanup = connectWebSocket();
      return () => {
        console.log('cleaned up ')
        cleanup.then((close) => close && close());
      };
    }
  }, [connectWebSocket, loading, username, roomExists, showDialog]);

  if (!roomExists) {
    return <ErrorPage />;
  }

  if (loading) {
    return <Loading />;
  }

  const onSent = (content: string) => {
    try {
      if (wsRef.current) {
        console.log('Sending message:', content);
        wsRef.current.send(content);
      }
    } catch (error) {
      toast.error("Internal error");
    }
  };

  const onLeave = () => {
    console.log('Leaving room');
    wsRef.current?.close();
    router.push("/").then(() => {
      console.log('Navigated to home page');
    }).catch((error) => {
      console.error('Error navigating to home page:', error);
    });
  };

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsername(usernameInput);
    setShowDialog(false);
  };

  return (
    <RoomProvider>
      <div className="flex flex-col h-screen" data-testid="container">
        <Navbar onLeave={onLeave} />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:flex lg:flex-1">
          </div>
          <div className="flex-1 overflow-y-auto">
            <QuestionList questions={questions} />
          </div>
          <div className="flex-1 border-s-2">
            <ChatWindow messages={messages} onSent={onSent} />
          </div>
        </div>
        {showDialog && (
          <Card className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 backdrop-blur-sm">
            <form onSubmit={handleUsernameSubmit} className="bg-white p-6 rounded-xl shadow-lg border-2 border-slate-100">

              <CardHeader>
                <CardTitle>
                  What's your name? ☺️
                </CardTitle>
              </CardHeader>
              <Input type="text" id="username" name="username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              <Button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md">Submit</Button>
            </form>
          </Card>
        )}
      </div>
    </RoomProvider>
  );
}

export default RoomPage;