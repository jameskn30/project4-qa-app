'use client'

import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import React, { useEffect, useCallback, useRef } from 'react';

export default function Home() {
  const roomId = '1'; // test room id = 1

  const connectWebSocket = useCallback(async () => {
    const response = await fetch(`/api/chat?roomId=${roomId}`);
    const data = await response.json();
    console.log(data)
    const ws = new WebSocket(data.websocketUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getRoomMembers = useCallback(async () => {

    const response = await fetch(`/api/list_members?roomtId=${roomId}`)

    const data = await response.json()
    console.log('list of members ')
    console.log(data.message)
  }, [])

  useEffect(() => {
    const cleanup = connectWebSocket();

    getRoomMembers()

    return () => {
      cleanup.then((close) => close && close());
    };
  }, [connectWebSocket]);

  return (
    <div className="flex flex-col h-screen" data-testid="container">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <QuestionList />
        </div>
        <div className="flex-1 border-s-2">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
