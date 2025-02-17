'use client'
import QuestionList from '@/app/components/QuestionList';
import React, { useCallback, useRef, useEffect, useState } from 'react';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import { RoomProvider } from '@/app/room/[roomId]/RoomContext';
import { isRoomExists } from '@/utils/room';
import { useRouter, useParams } from 'next/navigation';
import Loading from './loading'
import Error from './error';
import { toast } from 'sonner';
import { generateRandomUsername } from '@/utils/common';

const RoomPage: React.FC = () => {
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null;
  const [loading, setLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const [username, setUsername] = useState<string>(generateRandomUsername());
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(async () => {

    if (username === null || roomId === null) {
      return;
    }

    console.log('connect websocket');
    const response = await fetch(`/api/chat?roomId=${roomId}&username=${username}`);

    const data = await response.json();

    const ws = new WebSocket(data.websocketUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      toast.success("Joined room");
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
    const checkRoomExists = async () => {
      console.log('if room exists')
      if (!roomId || !(await isRoomExists(roomId))) {
        setRoomExists(false);
      }
      setLoading(false);
    };

    checkRoomExists();

    if (username && roomExists) {
      const cleanup = connectWebSocket();
      return () => {
        cleanup.then((close) => close && close());
      };
    }
  }, [connectWebSocket, username, roomExists]);

  if (loading) {
    return <Loading />;
  }

  if (!roomExists) {
    return <Error />;
  }

  return (
    <RoomProvider>
      <div className="flex flex-col h-screen" data-testid="container">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:flex lg:flex-1">
          </div>
          <div className="flex-1 overflow-y-auto">
            <QuestionList />
          </div>
          <div className="flex-1 border-s-2">
            <ChatWindow wsRef={wsRef} username={username} />
          </div>
        </div>
      </div>
    </RoomProvider>
  );
}

export default RoomPage;