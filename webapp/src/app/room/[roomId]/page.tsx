'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import { RoomProvider } from '@/app/room/[roomId]/RoomContext';
import { isRoomExists } from '@/utils/room';
import { useRouter, useParams } from 'next/navigation';
import Loading from './loading'
import { generateRandomMessages, generateRandomQuestions } from '@/app/utils/mock';
import { toast } from 'sonner';
import { generateRandomUsername } from '@/utils/common';
import { Message } from '@/app/components/ChatWindow';
import { QuestionItem } from '@/app/components/QuestionList';

const RoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null;
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const [username, setUsername] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(generateRandomMessages(10));
  const [questions, setQuestions] = useState<QuestionItem[]>(generateRandomQuestions(10));

  useEffect(() => {
    setUsername(generateRandomUsername());
  }, []);

  useEffect(() => {
    const checkRoomExists = async () => {
      if (!roomId || !(await isRoomExists(roomId))) {
        throw new Error(`Room ${roomId} not found`);
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
    if (!loading && username) {
      const cleanup = connectWebSocket();
      return () => {
        console.log('cleaned up ')
        cleanup.then((close) => close && close());
      };
    }
  }, [connectWebSocket, loading, username]);

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
      </div>
    </RoomProvider>
  );
}

export default RoomPage;