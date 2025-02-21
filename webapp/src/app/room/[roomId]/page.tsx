'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import { RoomProvider } from '@/app/room/[roomId]/RoomContext';
import { clearQuestions, syncRoom } from '@/utils/room';
import { isRoomExists } from '@/utils/room.v2';
import { getUserData as _getUserData, UserData } from '@/utils/supabase/auth'
import { useRouter, useParams, usePathname } from 'next/navigation';
import Loading from './loading'
import ErrorPage from './error';
import { toast, Toaster } from 'sonner';
import { generateRandomUsername } from '@/utils/common';
import { Message } from '@/app/components/ChatWindow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { groupMessages, upvoteMessage, newRound, closeRoom, amIHost } from '@/utils/room';
import { QuestionItem } from '@/app/components/QuestionList'
import { MdReportGmailerrorred } from "react-icons/md";
// import { createClient } from '@/utils/supabase/component'
// import { getUserData } from '@/utils/supabase/auth';
import { FaExclamation, FaRegComments, FaArrowRotateRight, FaTrashCan, FaAngleUp, FaAngleDown, FaSquarePollVertical } from "react-icons/fa6";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import MessageInput from '@/app/components/MessageInput';

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
  const [questionsLeft, setQuestionsLeft] = useState(3)
  const [upvotesLeft, setUpvotesLeft] = useState(3)
  const [hostMessage, setHostMessage] = useState('')
  const [roomClosed, setRoomClosed] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [isHost, setIsHost] = useState(false)
  const currPath = usePathname()

  //TODO: duplicated with the logic in dashboard, use state management
  // type UserData = {
  //   username: string,
  //   userId: string,
  //   email: string,
  // }
  const [userData, setUserData] = useState<UserData | null>(null)

  // const supabase = createClient()

  useEffect(() => {
    if (!username) {
      setUsername(generateRandomUsername());
    }
  }, [username]);

  useEffect(() => {

    const checkRoomExists = async () => {
      if (roomId !== null) {
        try {
          const exists = await isRoomExists(roomId)

          if (exists) {
            if (exists) {
              setRoomExists(true);
            } else {
              console.log()
              setRoomExists(false);
            }
            setLoading(false)
          }

        } catch (err) {
          console.error(err)
          setRoomExists(false);
          setLoading(false)
        }
      };
    }

    checkRoomExists();

    const getUserData = async () => {
      const user = await _getUserData()
      console.log(user)
      setUserData(user)
    }

    getUserData()

  }, [roomId]);

  const connectWebSocket = useCallback(async () => {
    if (!username) {
      toast.error('Internal error');
      return;
    }

    const response = await fetch(`/api/chat?roomId=${roomId}&username=${username}`);
    const data = await response.json();
    console.log('URL = ' + data.websocketUrl)
    const ws = new WebSocket(data.websocketUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      toast.success("Joined room");
    };

    ws.onmessage = (event) => {
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
          setQuestionsLeft(3)
          setUpvotesLeft(3)
        }
        else if (command === "close_room") {
          setRoomClosed(true);
          setTimeout(() => {
            onLeave()
          }, 3000);
        }
      }
    };

    ws.onclose = () => {
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

      if (userData) {
        amIHost(roomId!!, '1')
          .then(res => {
            if (res.ok) {
              setIsHost(true)
            }
          })
          .catch(err => {
            console.error(err)
          }).finally(() => { })
      }

      syncRoom(roomId!!)
      .then(res => res.json())
      .then(data => {
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
    if (questionsLeft <= 0) {
      toast.error('You have no more questions left')
      return
    }
    setQuestionsLeft(questionsLeft - 1)
    try {
      if (wsRef.current) {
        wsRef.current.send(content);
        setQuestionsLeft(questionsLeft - 1)
      }
    } catch (error) {
      toast.error("Internal error");
    }
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
    setLoadingQuestions(false);
  }

  const handleClearQuestion = () => {
    clearQuestions(roomId!!)
  }

  const handleUpvote = (uuid: string) => {
    if (upvotesLeft <= 0) {
      toast.error('You have no more upvotes left')
      return
    }
    setUpvotesLeft(upvotesLeft - 1)
    upvoteMessage(roomId!!, uuid, username)
      .then(res => res.json())
      .catch(err => {
        toast.error('An error occured, try restarting')
      })
      .finally(() => { })
  }

  const handleRestartRound = () => {
    newRound(roomId!!)
      .then(res => res.json())
      .then(data => { })
      .catch(err =>
        console.error(err)
      )
      .finally(() => { })
  }

  const handleCloseRoom = () => {
    setShowCloseRoomDialog(true);
  }

  const confirmCloseRoom = () => {
    closeRoom(roomId!!)
      .then(res => res.json())
      .then(data => {
        onLeave()
      })
      .catch(err => {
        toast.error("Error while closing room")
      })
      .finally(() => {
        setShowCloseRoomDialog(false);
      })
  }

  const onLeave = () => {
    wsRef.current?.close();

    router.push("/").then(() => {
    }).catch((error: any) => {
      console.error('Error navigating to home page:', error);
    });
  }

  return (
    <RoomProvider>
      <div className="flex flex-col h-screen items-center bg-gray-50">
        <Toaster expand={true} position='top-center' richColors />

        <Navbar onLeave={onLeave} />
        {
          isHost &&
          <div id="button-container" className="flex gap-4 justify-center items-center">
            <p>You're the host</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button className='justify-between bg-blue-500 text-white hover:bg-blue-700 font-bold flex gap-2'>  <FaAngleDown /> Live Q&A</Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <Button onClick={handleGroupQuestions} className='justify-between w-full mb-2 bg-blue-500 text-white hover:bg-blue-700 font-bold flex'><FaRegComments /> Group questions</Button>
                <Button onClick={handleClearQuestion} className='justify-between w-full mb-2 bg-yellow-500 text-white hover:bg-yellow-700 font-bold flex'><FaTrashCan /> Clear questions</Button>
                <Button onClick={handleRestartRound} className='justify-between w-full mb-2 bg-red-500 text-white hover:bg-red-700 font-bold flex'><FaArrowRotateRight /> Restart round</Button>
                <Button onClick={handleCloseRoom} className='justify-between w-full bg-red-500 text-white hover:bg-red-700 font-bold flex'><FaExclamation /> Close room</Button>
              </PopoverContent>
            </Popover>
            {/* Poll button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button className='bg-blue-500 text-white hover:bg-blue-700 font-bold flex gap-2'>  <FaAngleDown /> Live Polling</Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <Button className='justify-between w-full mb-2 bg-blue-500 text-white hover:bg-blue-700 font-bold flex'><FaSquarePollVertical /> Create polls</Button>
              </PopoverContent>
            </Popover>
          </div>
        }

        <div className="flex gap-2 lg:mt-4 h-50 w-full bg-slate-100 overflow-y-auto lg:px-10 ">
          <div className="flex flex-1 flex-col bg-white shadow-lg rounded-md border border-slate-200 w-2/3 min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 ">
              <QuestionList
                questions={questions}
                handleUpvote={handleUpvote}
                handleGroupQuestions={handleGroupQuestions}
                loadingQuestions={loadingQuestions}
                hostMessage={hostMessage}
                roundNumber={1}
                isHost={isHost}
                handleClearQuestion={handleClearQuestion}
                handleRestartRound={handleRestartRound}
                handleCloseRoom={handleCloseRoom}
              />
            </div>
            {
              isHost === false && (
                <div id='chat-container' className="w-full flex flex-col justify-center items-center border border-slate-100  p-5 pb-10 ">
                  <Button variant="outline" className="lg:hidden flex-shrink mb-4 text-gray-500 flex justify-center items-center gap-4"> <FaAngleUp /> more chat</Button>

                  <div className="flex flex-col gap-2 w-full lg:w-3/4 justify-center">
                    <div className="top-0 flex justify-center w-full gap-4 text-center">
                      <div className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md">{questionsLeft} questions left</div>
                      <div className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md">{upvotesLeft} upvotes left</div>
                    </div>
                    <MessageInput onSent={onSent} />

                  </div>
                </div>

              )
            }
          </div>
          <div className="lg:flex flex-col bg-white shadow-lg rounded-lg hidden m-2 w-1/3">
            <ChatWindow messages={messages} onSent={onSent} questionsLeft={questionsLeft} upvoteLeft={upvotesLeft} isHost={isHost} />
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
              <Button type="submit" variant="default" className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md">Submit</Button>
            </form>
          </Card>
        )}
        {roomClosed && (
          <Card className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-slate-100 w-full max-w-sm text-center">
              <CardHeader>
                <CardTitle>
                  Room Closed
                </CardTitle>
              </CardHeader>
              <p className="mt-4">The room has been closed and is no longer accessible. You will be redirected to the homepage shortly.</p>
            </div>
          </Card>
        )}
        {showCloseRoomDialog && (
          <Card className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-slate-100 w-full max-w-sm text-center">
              <CardHeader>
                <CardTitle className='flex gap-2 justify-center text-xl'>
                  <MdReportGmailerrorred />
                  Confirm Close Room
                </CardTitle>
              </CardHeader>
              <p className="mt-4">Are you sure you want to close the room?</p>
              <p className="mt-4">This action can't be undone</p>
              <div className="mt-4 flex justify-center gap-4">
                <Button variant={"destructive"} onClick={confirmCloseRoom} >Yes, Close Room</Button>
                <Button variant="secondary" onClick={() => setShowCloseRoomDialog(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </RoomProvider>
  );
}

export default RoomPage;