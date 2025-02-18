'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import { RoomProvider } from '@/app/room/[roomId]/RoomContext';
import { isRoomExists, syncRoom } from '@/utils/room';
import { useRouter, useParams } from 'next/navigation';
import Loading from './loading'
import ErrorPage from './error';
import { toast } from 'sonner';
import { generateRandomUsername } from '@/utils/common';
import { Message } from '@/app/components/ChatWindow';
import { QuestionItem } from '@/app/components/QuestionList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { groupMessages } from '@/utils/room';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

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

      console.log('calling sync room')
      syncRoom(roomId!!).then(res => res.json()).then(data => {
        console.log('sync room')

        // Sync messages
        setMessages(data.messages.map((message: { username: string, content: string }) => ({
          username: message.username,
          content: message.content,
          flag: '🇺🇸'
        })));

        // Sync questions
        console.log('questions')
        console.log(data.questions);
        setQuestions(data.questions.map((question: { content: string, upvotes: number, downvotes: number }) => ({
          content: question.content,
          upvotes: question.upvotes,
          downvotes: question.downvotes
        })));

      }).catch(err => {
        toast.error(err);
        console.error(err)
      });

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
    try {
      const response = await fetch('/chatapi/is_username_unique', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, username: usernameInput }),
      });

      if (response.ok) {
        setUsername(usernameInput);
        setShowDialog(false);
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Username is already taken');
      }
    } catch (error) {
      toast.error('Error checking username uniqueness');
    }
  };

  const handleGroupQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await groupMessages(roomId!!);
      if (response.ok) {
        const data = await response.json();
        console.log('grouped questions :', data.questions);
        // setQuestions

        setQuestions(data.questions.map((content: string) => ({
          content: content,
          upvotes: 0,
          downvotes: 0
        })));
        toast.success('Grouped questions');
      } else {
        toast.error('Failed to group questions');
      }
    } catch (error) {
      toast.error('Error grouping questions');
      console.error(error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleClearQuestion = () => {
    console.log('handleClearQuestion')
    setLoadingQuestions(true);
    setQuestions([])
    setLoadingQuestions(false);
  }

  return (
    <RoomProvider>
      <div className="flex flex-col h-screen items-center bg-gray-50">
        <Navbar onLeave={onLeave} />
        <div className="flex flex-1 overflow-hidden w-full lg:w-2/3 flex-col lg:flex-row bg-white shadow-lg rounded-lg">
          <div className="lg:w-2/3 overflow-y-auto border-r border-gray-300 p-4">
            <QuestionList questions={questions} handleGroupQuestions={handleGroupQuestions} loadingQuestions={loadingQuestions} handleClearQuestion={handleClearQuestion}/>
          </div>
          <div className="lg:w-1/3 flex-1 p-4">
            <ChatWindow messages={messages} onSent={onSent} />
          </div>
        </div>
        {showDialog && (
          <Card className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 backdrop-blur-sm p-4">
            <form onSubmit={handleUsernameSubmit} className="bg-white p-6 rounded-xl shadow-lg border-2 border-slate-100 w-full max-w-sm">
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