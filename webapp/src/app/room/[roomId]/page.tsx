'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import { RoomProvider } from '@/app/room/[roomId]/RoomContext';
import { clearQuestions, isRoomExists, syncRoom } from '@/utils/room';
import { useRouter, useParams } from 'next/navigation';
import Loading from './loading'
import ErrorPage from './error';
import { toast } from 'sonner';
import { generateRandomUsername } from '@/utils/common';
import { Message } from '@/app/components/ChatWindow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { groupMessages, upvoteMessage, newRound } from '@/utils/room';

const RoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null;
  const [loading, setLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const [username, setUsername] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [showDialog, setShowDialog] = useState(!username);
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  // const { Canvas } = useQRCode();
  const [questionsLeft, setQuestionsLeft] = useState(3)
  const [upvotesLeft, setUpvotesLeft] = useState(3)
  const [hostMessage, setHostMessage] = useState('')

  useEffect(() => {
    if (!username) {
      setUsername(generateRandomUsername());
    }
  }, [username]);

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
      const type = parsedData.type;

      if (type === "message") {
        const content = parsedData.message;
        const username = parsedData.username;
        const message: Message = { username, content, flag: '🇺🇸' };
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      else if (type === "questions") {
        const newQuestions = parsedData.questions.map((question: { uuid: string, rephrase: string, upvotes: number, downvotes: number }) => ({
          uuid: question.uuid,
          rephrase: question.rephrase,
          upvotes: question.upvotes,
          downvotes: question.downvotes
        }));
        setQuestions(newQuestions)
        setLoadingQuestions(false)
        setHostMessage("")
      }
      else if (type === 'upvote') {
        const questionId = parsedData.questionId;
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question.uuid === questionId
              ? { ...question, upvotes: question.upvotes + 1 }
              : question
          )
        );
      }
      else if (type === 'command') {
        const command = parsedData.command;
        if (command === 'clear_questions') {
          clearQuestionsAction()
          setHostMessage("Host cleared questions")
        }
        else if (command === "grouping_questions") {
          setLoadingQuestions(true)
          setHostMessage("Host grouping questions")
        }
        else if (command === "new_round") {
          setHostMessage("Host started new round of questions")
          setMessages([])
          setQuestions([])
        }
      }

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
        setMessages(data.messages.map((message: { username: string, content: string }) => ({
          username: message.username,
          content: message.content,
          flag: '🇺🇸'
        })));

        setQuestions(data.questions.map((question: { uuid: string, rephrase: string, upvotes: number }) => ({
          uuid: question.uuid,
          rephrase: question.rephrase,
          upvotes: question.upvotes,
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
        setQuestionsLeft(questionsLeft - 1)
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
    }).catch((error: any) => {
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
        // setQuestions
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

  const clearQuestionsAction = () => {
    setLoadingQuestions(true);
    setQuestions([])
    //TODO: send clear messages in room to chatapi
    setLoadingQuestions(false);
  }

  const handleClearQuestion = () => {
    console.log('handleClearQuestion')
    clearQuestions(roomId!!)
  }

  const handleUpvote = (uuid: string) => {
    console.log(`handleUpvote for ${uuid}`)
    upvoteMessage(roomId!!, uuid, username)
      .then(res => res.json())
      .catch(err => {
        console.log(err)
        toast.error('An error occured, try restarting')
      })
      .finally(() => { })
  }

  const handleRestartRound = () => {
    console.log("handleRestartRound")
    newRound(roomId!!)
      .then(res => res.json())
      .then(data => { })
      .catch(err =>
        console.error(err)
      )
      .finally(() => { })
  }

  return (
    <RoomProvider>
      <div className="flex flex-col h-screen items-center bg-gray-50">

        <Navbar onLeave={onLeave} />

        <div className="flex flex-1 overflow-hidden w-full flex-col lg:flex-row bg-white shadow-lg rounded-lg">
          <div className="flex-1 overflow-y-auto border-r border-gray-300 p-4">
            <QuestionList
              questions={questions}
              handleUpvote={handleUpvote}
              handleGroupQuestions={handleGroupQuestions}
              loadingQuestions={loadingQuestions}
              hostMessage={hostMessage}
              roundNumber={1}
              handleClearQuestion={handleClearQuestion}
              handleRestartRound={handleRestartRound}
            />

          </div>
          <div className="flex-1 p-4">
            <ChatWindow messages={messages} onSent={onSent} questionsLeft={questionsLeft} />
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
              <Input type="text" id="username" name="username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required />
              <Button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md">Submit</Button>
            </form>
          </Card>
        )}
      </div>
    </RoomProvider>
  );
}

export default RoomPage;