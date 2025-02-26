'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import _, { add } from 'lodash';

// Components
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import Loading from './loading';
import ErrorPage from './error';
import MessageInput from '@/app/components/MessageInput';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Icons
import { FaRegComments, FaArrowRotateRight, FaTrashCan, FaAngleUp, FaSquarePollVertical } from "react-icons/fa6";
import { ChartColumnBig, MessagesSquare, ScanQrCode, Trash, Copy, Skull } from 'lucide-react';

// Utils & Types
import { RoomProvider } from '@/app/room/[roomName]/RoomContext';
import { getUserData as _getUserData, UserData } from '@/utils/supabase/auth';
import { Message } from '@/app/components/ChatWindow';
import { QuestionItem } from '@/app/components/QuestionList';
import {
  groupMessages,
  clearQuestions,
  fetchRoom,
  fetchMessages,
  insertQuestions,
  fetchQuestions,
  closeRoom,
  submitFeedback,
  addMessage
} from '@/utils/room.v2';
import { storeSessionData, removeSession, getStoredSessionData } from '@/utils/localstorage';
import { createClient } from '@/utils/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';


const RoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ roomName: string }>();
  const roomName = params?.roomName ? decodeURIComponent(params.roomName) : null;
  const supabase = createClient();

  // Room state
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const [roomClosed, setRoomClosed] = useState(false);

  // User state
  const [username, setUsername] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);

  // UI state
  const [showDialog, setShowDialog] = useState(!username);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [showRestartRoomDialog, setShowRestartRoomDialog] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);

  // Content state
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [hostMessage, setHostMessage] = useState('');
  const [channel, setChannel] = useState<any>(null);

  // Limits
  const GIVEN_QUESTIONS = 1;
  const GIVEN_UPVOTES = 1;
  const [questionsLeft, setQuestionsLeft] = useState(GIVEN_QUESTIONS);
  const [upvotesLeft, setUpvotesLeft] = useState(GIVEN_UPVOTES);

  // Add these near other state declarations
  const [feedback, setFeedback] = useState('');

  // Memoize event handlers
  const handleUpvote = useCallback((uuid: string) => {
    if (upvotesLeft <= 0) {
      toast.error('You have no more upvotes left')
      return
    }

    try {
      channel?.send({
        type: 'broadcast',
        event: 'upvote',
        payload: { questionId: uuid }
      });
      setUpvotesLeft(prev => prev - 1);
    } catch (error) {
      console.error('Error broadcasting upvote:', error);
      toast.error('Failed to upvote');
    }
  }, [channel, upvotesLeft]);

  const onSent = useCallback((content: string) => {
    if (questionsLeft <= 0) {
      toast.error('You have no more questions left')
      return
    }

    try {
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'message',
          payload: { username, content }
        });
        setQuestionsLeft(prev => prev - 1);
      }
    } catch (error) {
      toast.error("Internal error");
    } finally {
      setShowMessageInput(false);
    }
  }, [channel, questionsLeft, username]);

  // Separate channel setup into its own effect
  useEffect(() => {
    if (!username || !roomName) return;

    const channel = supabase.channel(`room-${roomName}`, {
      config: {
        broadcast: { self: true },
      }
    });

    // Handle messages
    channel.on('broadcast', { event: 'message' }, ({ payload }) => {
      const { username, content } = payload;
      const message: Message = { username, content, flag: '🇺🇸' };
      setMessages((prevMessages) => [...prevMessages, message]);
      if (roomData?.isHost){
        addMessage(roomData.id, content, username, 1)
      }
    });

    // Handle questions
    channel.on('broadcast', { event: 'questions' }, ({ payload }) => {
      setQuestions(payload.questions.map((question: { uuid: string, rephrase: string, upvotes: number }) => ({
        uuid: question.uuid,
        rephrase: question.rephrase,
        upvotes: question.upvotes,
      })));
      setLoadingQuestions(false);
      setHostMessage("");
    });

    const updateQuestionsOnDb = _.debounce(async (questions: QuestionItem[]) => {
      await insertQuestions(roomData.id, questions, 1);
      console.log('updated questions on db')
    }, 2000);

    // Handle upvotes
    channel.on('broadcast', { event: 'upvote' }, ({ payload }) => {
      setQuestions(prevQuestions => {
        const updatedQuestions = prevQuestions.map(question =>
          question.uuid === payload.questionId
            ? { ...question, upvotes: (question.upvotes || 0) + 1 }
            : question
        );

        if (roomData?.isHost) {
          // insertQuestions(roomData.id, updatedQuestions, 1);
          updateQuestionsOnDb(updatedQuestions);
        }

        return updatedQuestions;
      });
    });

    // Handle commands
    channel.on('broadcast', { event: 'command' }, ({ payload }) => {
      const { command } = payload;
      switch (command) {
        case 'clear_questions':
          setLoadingQuestions(true);
          setQuestions([])
          setLoadingQuestions(false);
          setHostMessage("Host cleared questions");
          break;
        case 'grouping_questions':
          setLoadingQuestions(true);
          setHostMessage("Host grouping questions");
          break;
        case 'new_round':
          setHostMessage("Host started new round of questions");
          setMessages([]);
          setQuestions([]);
          setQuestionsLeft(GIVEN_QUESTIONS);
          setUpvotesLeft(GIVEN_UPVOTES);
          break;
        case 'close_room':
          setRoomClosed(true);
          // setTimeout(onLeave, 3000);
          break;
      }
    });

    channel.subscribe();
    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [roomName, username, roomData]);

  //USE EFFECT

  useEffect(() => {

    const checkRoomExists = async () => {
      if (roomName !== null) {
        try {
          const res = await fetchRoom(roomName)

          // const { name, isHost, id } = res;

          if (res) {
            setRoomExists(true);
            setRoomData(res)

          } else {
            console.error('room does not exist')
            setRoomExists(false);

          }

          setLoading(false)

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
      setUserData(user)
      if (user) {
        setUsername(user.username)
        setShowDialog(false)
      } else {
        const storedSession = getStoredSessionData();

        if (storedSession && !username) {
          setUsername(storedSession.username);
          setQuestionsLeft(storedSession.questionsLeft);
          setUpvotesLeft(storedSession.upvotesLeft);
          setShowDialog(false)
        }
      }
    }

    getUserData()

  }, [roomName]);

  // Initial data sync
  useEffect(() => {
    console.log('setting up username and websocket')

    if (!loading && username && !showDialog && roomData) {

      storeSessionData(roomName!!, username, questionsLeft, upvotesLeft)

      const sync = async () => {
        const [messages, questions] = await Promise.all([
          fetchMessages(roomData.id),
          fetchQuestions(roomData.id, 1)
        ]);

        setMessages(messages.map(message => ({
          username: message.guest_name,
          content: message.content,
          flag: '🇺🇸'
        })));

        setQuestions(questions.map((question: any) => ({
          uuid: question.uuid,
          rephrase: question.rephrase,
          upvotes: question.upvotes,
        })));
      };

      sync();
    } else {
      console.log('not setting up username and websocket')
    }
  }, [loading, username, showDialog, roomData]);


  if (!roomExists) {
    return <ErrorPage />;
  }

  if (loading) {
    return <Loading />;
  }

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setUsername(usernameInput);
      setShowDialog(false);
    } catch (error) {
      toast.error('Error checking username uniqueness');
    }
  };

  const handleGroupQuestions = async () => {
    setLoadingQuestions(true);
    try {

      channel?.send({
        type: 'broadcast',
        event: 'command',
        payload: { command: 'grouping_questions' }
      })

      const res = await groupMessages(messages.map(msg => msg.content));

      // Broadcast the grouped questions to all room participants
      broadcastQuestions(
        res.message.map((item: any) => ({
          uuid: item.uuid,
          rephrase: item.rephrase,
          upvotes: item.upvotes,
        }))
      )

      //insert or update the questions
      await insertQuestions(roomData.id, res.message, 1)

      toast.success('Grouped questions');
    } catch (error) {
      toast.error('Error grouping questions');
      console.error(error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const broadcastQuestions = (questions: QuestionItem[]) => {
    channel?.send({
      type: 'broadcast',
      event: 'questions',
      payload: {
        questions: questions
      }
    });

  }


  const handleClearQuestion = async () => {
    await clearQuestions(roomData.id, 1)

    channel?.send({
      type: 'broadcast',
      event: 'command',
      payload: { command: 'clear_questions' }
    })
  }

  const handleRestartRound = () => {
    setShowRestartRoomDialog(true);
  }

  const confirmRestartRound = () => {
    console.log("confirmRestartRound")
    setShowRestartRoomDialog(false)
  }

  const handleCloseRoom = () => {
    setShowCloseRoomDialog(true);
  }

  const confirmCloseRoom = () => {
    console.log("confirmCloseRoom")

    closeRoom(roomData.id)
      .then(_ => {
        toast.success("Room closed successfully")
        channel?.send({
          type: 'broadcast',
          event: 'command',
          payload: { command: 'close_room' }
        })
      })
      .catch(err => {
        toast.error("Error while closing room, try again later")
        console.error(err)
      })
      .finally(() => {
      })





  }

  const onLeave = () => {
    if (channel) {
      channel.unsubscribe();
    }
    removeSession();
    router.push("/");
  };

  const handleQuestionButtonClick = () => {
    setShowMessageInput(true);
  };

  // Add these before the return statement
  const handleFeedbackSubmit = (type: 'like' | 'dislike') => {
    // Here you can implement the feedback submission logic
    console.log('Feedback:', { type, message: feedback });
    setFeedbackSent(true);
  };

  return (
    <RoomProvider>
      <div className="flex flex-col h-screen items-center bg-gradient-to-r from-white to-blue-200">
        <Toaster expand={true} position='top-center' richColors />
        <Navbar
          onLeave={onLeave}
          userData={userData}
        />
        <div className="flex-col px-2 flex flex-1 gap-1 w-full lg:px-5 mb-3 h-1/2 lg:flex-row">
          <div className="flex flex-1 flex-col lg:w-2/3 w-full h-1/3 lg:h-full">
            <div className="flex-1 py-2 h-full overflow-y-auto">
              <QuestionList
                questions={questions}
                handleUpvote={handleUpvote}
                handleGroupQuestions={handleGroupQuestions}
                loadingQuestions={loadingQuestions}
                hostMessage={hostMessage}
                roundNumber={1}
                isHost={roomData.isHost}
                handleClearQuestion={() => console.log('clear questions')}
                handleRestartRound={() => { }}
                handleCloseRoom={() => { }}
              />
            </div>
          </div>
          <div className="lg:flex lg:w-1/3 w-full gap-2 flex-col my-2">
            {
              roomData.isHost && (
                <div className="w-full">
                  <Card className="flex flex-col overflow-y-auto relative rounded-2xl bg-white h-full">
                    <CardHeader>
                      <CardTitle className='flex justify-center items-center gap-1'>
                        You are host of: <span className="bg-yellow-300 text-black rotate-2 p-1">{roomName}</span>
                        <Button variant="ghost"><Copy /></Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className='grid grid-cols-2 w-full gap-1'>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button className='text-center w-full mb-2 bg-blue-500 text-white hover:bg-blue-700 font-bold flex'><MessagesSquare /> Live Q&A</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2 backdrop-blur-sm">
                            <Button onClick={handleGroupQuestions} className='justify-between w-full mb-2 bg-blue-500 text-white hover:bg-blue-700 font-bold flex'><FaRegComments /> Group questions</Button>
                            <Button onClick={handleClearQuestion} className='justify-between w-full mb-2 bg-yellow-500 text-white hover:bg-yellow-700 font-bold flex'><FaTrashCan /> Clear Q&A</Button>
                            <Button onClick={handleRestartRound} className='justify-between w-full mb-2 bg-red-500 text-white hover:bg-red-700 font-bold flex'><FaArrowRotateRight /> Restart Q&A</Button>
                          </PopoverContent>
                        </Popover>
                        {/* Poll button */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button className='text-center w-full mb-2 bg-yellow-500 text-white hover:bg-yellow-700 font-bold flex'><ChartColumnBig /> Start polls</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2 backdrop-blur-sm">
                            <Button className='text-center w-full mb-2 bg-blue-500 text-white hover:bg-blue-700 font-bold flex'><FaSquarePollVertical /> Create polls</Button>
                          </PopoverContent>
                        </Popover>
                        <Button className='text-center w-full mb-2 bg-green-700 text-white hover:bg-yellow-700 font-bold flex'><ScanQrCode /> Show room QR</Button>
                        <Button variant="destructive" className='text-center w-full mb-2 font-bold flex' onClick={handleCloseRoom}><Trash /> Close room</Button>
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              )
            }

            <div className='h-1/3 lg:h-1/2 lg:flex-grow hidden lg:block bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto' id='chat-container'>
              <ChatWindow messages={messages} onSent={onSent} questionsLeft={questionsLeft} upvoteLeft={upvotesLeft} isHost={roomData.isHost} />

              <div className="lg:hidden">
                <Button variant="outline" className="lg:hidden flex-shrink text-gray-500 flex justify-between items-center gap-3"> <FaAngleUp /> more chat</Button>
              </div>
            </div>
            {
              !roomData.isHost && (
                <Card id='chat-container' className="w-full flex flex-col justify-center items-center lg:mb-5 p-2 rounded-xl bg-white gap-2">
                  <p className="font-bold">Ask your questions</p>
                  <div className="flex flex-col gap-2 w-full justify-center">
                    <div className="top-0 flex justify-center w-full gap-4 text-center">

                      <Button
                        id='question-button'
                        onClick={handleQuestionButtonClick}
                        className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-700">
                        {questionsLeft} questions left
                      </Button>
                      <Button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700">
                        {upvotesLeft} upvotes left
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            }
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>What's your name? ☺️</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUsernameSubmit}>
              <Input
                type="text"
                id="username"
                name="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <Button type="submit" variant="default" className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md">
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showRestartRoomDialog} onOpenChange={setShowRestartRoomDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex gap-2 justify-center text-xl'>
                <Skull className="h-5 w-5" />
                Confirm Start New Q&A Round
              </DialogTitle>
            </DialogHeader>
            <p className="mt-4">Are you sure you want to start a new round?</p>
            <p className="mt-4">All users questions will be archived and everyone will have <br /> <span className="bg-orange-200"> {GIVEN_QUESTIONS} questions </span>and <span className="bg-orange-200">{GIVEN_UPVOTES} upvotes</span> again </p>
            <div className="mt-4 flex justify-center gap-4">
              <Button variant={"destructive"} onClick={confirmRestartRound}>Yes, Restart</Button>
              <Button variant="secondary" onClick={() => setShowRestartRoomDialog(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCloseRoomDialog} onOpenChange={setShowCloseRoomDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex gap-2 justify-center text-xl'>
                <Skull className="h-5 w-5" />
                <span className="bg-red-200 p-1">
                  DANGER, DANGER !!
                </span>
              </DialogTitle>
            </DialogHeader>
            <p className="mt-4">
              This action will save your activities (questions, messages, ...) and will kick all participants out. It can't be undone</p>
            <div className="mt-4 flex justify-center gap-4">
              <Button variant={"destructive"} onClick={confirmCloseRoom}>Yes, Close Room</Button>
              <Button variant="secondary" onClick={() => setShowCloseRoomDialog(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showMessageInput} onOpenChange={setShowMessageInput}>
          <DialogContent>
            <p className="text-xl font-bold text-black">Ask a question (1 left)</p>
            <MessageInput onSent={onSent} />
            <Button variant="secondary" onClick={() => setShowMessageInput(false)} className="mt-4 w-full">Close</Button>
          </DialogContent>
        </Dialog>

        <Dialog open={roomClosed} onOpenChange={() => router.push('/')}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Room by host</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" action={(formData) => {
              submitFeedback(formData).then(_ => {
                toast.success("Feedback submitted. Redirecting to home page")
                setTimeout(() => {
                  router.push('/')
                }, 1000)
              }
              ).catch(err => {
                toast.error("Some error happened, please close this tab ")
              })
            }}>
              <div className="flex gap-3 flex-col">
                <p className="mb-4">You can leave feedback, follow-up question, how you like the session, the host will be informed</p>
                <div className="flex justify-center gap-4 items-center">
                  <p>Do you think this session helpful?</p>
                  <div className="flex gap-2 justify-center items-center">
                    <Checkbox
                      id="like"
                      name="like"
                    />
                    <label htmlFor="like">
                      👍 Yes
                    </label>
                  </div>
                </div>
                <input name="roomId" id="roomId" className='hidden' value={roomData.id}/>
                <div>
                  <Input
                    id="feedback"
                    name="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Any feedback or follow-up question?"
                    className="mt-2"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
              >
                Submit and leave
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoomProvider>
  );
}

export default RoomPage;