'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import Image from 'next/image'

// Components
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import Loading from './loading';
import ErrorPage from './error';
import MessageInput from '@/app/components/MessageInput';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Icons
import { FaAngleUp } from "react-icons/fa6";
import { MessagesSquare } from 'lucide-react';

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
} from '@/utils/room.v2';
import {
  storeSessionData,
  removeSession,
} from '@/utils/localstorage';
import { createClient } from '@/utils/supabase/client';
import {
  setupRealtimeChannel,
  RealtimeChannelApi,
  RoomData,
  Participant,
} from '@/utils/realtime';

import HostController from '@/app/components/dialogs/HostController';
import UsernameDialog from '@/app/components/dialogs/UsernameDialog';
import RestartRoomDialog from '@/app/components/dialogs/RestartRoomDialog';
import CloseRoomDialog from '@/app/components/dialogs/CloseRoomDialog';
import SubmitFeedbackDialog from '@/app/components/dialogs/SubmitFeedbackDialog';


const RoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ roomName: string }>();
  const roomName = params?.roomName ? decodeURIComponent(params.roomName as string) : null;
  const supabase = createClient();

  // Add initialization tracker
  const initialized = useRef(false);

  // Room state
  const [roomData, setRoomData] = useState<RoomData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [roomExists, setRoomExists] = useState<boolean>(true);
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  const [hostOnline, setHostOnline] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // User state
  const [username, setUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // UI state
  const [showUsernameDialog, setShowUsernameDialog] = useState<boolean>(true);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [showRestartRoomDialog, setShowRestartRoomDialog] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);


  // Content state
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [hostMessage, setHostMessage] = useState('');

  // Limits
  const GIVEN_QUESTIONS = 1;
  const GIVEN_UPVOTES = 1;
  const [questionsLeft, setQuestionsLeft] = useState(GIVEN_QUESTIONS);
  const [upvotesLeft, setUpvotesLeft] = useState(GIVEN_UPVOTES);

  // Add these near other state declarations
  const [realtimeApi, setRealtimeApi] = useState<RealtimeChannelApi | null>(null);

  // Add state for mobile chat visibility
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Memoize event handlers
  const handleUpvote = useCallback((uuid: string) => {
    if (upvotesLeft <= 0) {
      toast.error('You have no more upvotes left')
      return
    }

    try {
      realtimeApi?.sendUpvote(uuid);
      setUpvotesLeft(prev => prev - 1);
    } catch (error) {
      console.error('Error broadcasting upvote:', error);
      toast.error('Failed to upvote');
    }
  }, [realtimeApi, upvotesLeft]);

  const handleDeleteQuestion = useCallback((uuid: string, questions: QuestionItem[]) => {
    try {
      if (roomData && roomData.isHost) {
        const updatedQuestions = questions.filter(question => question.uuid !== uuid);
        realtimeApi?.broadcastQuestions(updatedQuestions);
      }
      return
    } catch (err) {
      console.error(err)
    }
  }, [realtimeApi, roomData])

  const onSent = useCallback((content: string) => {
    if (questionsLeft <= 0) {
      toast.error('You have no more questions left')
      return
    }

    try {
      realtimeApi?.sendMessage(content);
      setQuestionsLeft(prev => prev - 1);
    } catch (error) {
      toast.error("Internal error");
      console.error(error)
    } finally {
      setShowMessageInput(false);
    }
  }, [realtimeApi, questionsLeft]);

  const toggleMobileChat = () => {
    setShowMobileChat(!showMobileChat);
  };

  //USE EFFECT

  // Combine initialization effects into a single effect
  useEffect(() => {
    // Skip if already initialized or missing roomName
    if (initialized.current || !roomName) return;

    const initializeRoom = async () => {
      try {
        setLoading(true);

        // 1. Fetch room data
        const res = await fetchRoom(roomName);
        if (res) {
          setRoomExists(true);
          setRoomData(res);
        } else {
          console.error('room does not exist');
          setRoomExists(false);
          return;
        }

        // 2. Get user data
        const user = await _getUserData();
        setUserData(user);

        if (user) {
          setUsername(user.username);
          setShowUsernameDialog(false);
        }

        // const storedSession = getStoredSessionData();
        // console.log('stored session ', storedSession)

        // if (storedSession) {
        //   setUsername(storedSession.username);
        //   setQuestionsLeft(storedSession.questionsLeft);
        //   setUpvotesLeft(storedSession.upvotesLeft);
        //   setShowUsernameDialog(false);
        // }
        initialized.current = true;
      } catch (err) {
        console.error('Error initializing room:', err);
        setRoomExists(false);
      } finally {
        setLoading(false);
      }
    };

    initializeRoom();
  }, [roomName]);

  // Separate channel setup into its own effect, with proper dependencies
  useEffect(() => {
    if (!username || !roomName || !roomData || !initialized.current) return;

    const handlers = {
      setMessages,
      setQuestions,
      setLoadingQuestions,
      setHostMessage,
      setQuestionsLeft,
      setUpvotesLeft,
      setHostOnline,
      setRoomClosed,
      setParticipants
    };

    const config = {
      GIVEN_QUESTIONS,
      GIVEN_UPVOTES
    };

    const api = setupRealtimeChannel(
      supabase,
      roomName,
      roomData,
      username,
      handlers,
      config
    );

    setRealtimeApi(api);

    return () => {
      api.unsubscribe();
    };
  }, [roomName, username, roomData, supabase]);

  // Initial data sync - only run once when all required data is available
  useEffect(() => {
    if (!initialized.current || !username || !roomName || !roomData) return;

    const sync = async () => {
      try {
        if (roomName) {
          storeSessionData(roomName, username, questionsLeft, upvotesLeft);
        }

        const [messages, questions] = await Promise.all([
          fetchMessages(roomData.id),
          fetchQuestions(roomData.id, 1)
        ]);

        setMessages(messages.map(message => ({
          username: message.guest_name,
          content: message.content,
          flag: '🇺🇸'
        })));

        setQuestions(questions.map((question: QuestionItem) => ({
          uuid: question.uuid,
          rephrase: question.rephrase,
          upvotes: question.upvotes,
        })));
      } catch (error) {
        console.error('Error syncing initial data:', error);
      }
    };

    sync();
  }, [roomData, username, roomName, initialized, questionsLeft, upvotesLeft]);


  if (!roomExists) {
    return <ErrorPage />;
  }

  if (loading) {
    return <Loading />;
  }

  const handleUsernameSubmit = async (username: string) => {
    try {
      if (username !== null && username.trim() !== '') {
        setUsername(username);
        setShowUsernameDialog(false);
      }
    } catch (err) {
      toast.error('Error checking username uniqueness');
      console.error(err)
    }
  };

  const handleGroupQuestions = async () => {
    setLoadingQuestions(true);
    try {
      realtimeApi?.sendCommand('grouping_questions');

      const res = await groupMessages(messages.map(msg => msg.content));

      // Broadcast the grouped questions to all room participants
      realtimeApi?.broadcastQuestions(
        res.message.map((item: QuestionItem) => ({
          uuid: item.uuid,
          rephrase: item.rephrase,
          upvotes: item.upvotes,
        }))
      );

      //insert or update the questions
      if (roomData) {
        await insertQuestions(roomData.id, res.message, 1);
        toast.success('Grouped questions');
      }

    } catch (error) {
      toast.error('Error grouping questions');
      console.error(error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleClearQuestion = async () => {
    if (roomData) {
      await clearQuestions(roomData.id, 1);
      realtimeApi?.sendCommand('clear_questions');
    }
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
    console.log("confirmCloseRoom");

    if (roomData) {

      closeRoom(roomData.id)
        .then(() => {
          realtimeApi?.sendCommand('close_room');
          toast.success("Room closed successfully");
        })
        .catch(err => {
          toast.error("Error while closing room, try again later");
          console.error(err);
        });
    }
  }

  const onLeave = () => {
    if (realtimeApi) {
      realtimeApi.unsubscribe();
    }
    removeSession();
    router.push("/");
  };

  const handleQuestionButtonClick = () => {
    setShowMessageInput(true);
  };

  return (
    <RoomProvider>
      <div className="flex flex-col h-screen items-center bg-gradient-to-r from-white to-blue-200">
        <Toaster expand={true} position='top-center' richColors />
        <Navbar
          onLeave={onLeave}
          userData={userData}
          loading={false}
        />

        {/* Removed mobile chat overlay in favor of Dialog component */}

        <div className="flex-col px-2 flex flex-1 gap-1 w-full lg:px-5 mb-3 h-1/2 lg:flex-row">
          <div className="flex flex-1 flex-col lg:w-2/3 w-full h-1/3 lg:h-full">
            <div className="flex-1 py-2 h-full overflow-y-auto">
              <QuestionList
                questions={questions}
                handleUpvote={handleUpvote}
                handleDeleteQuestion={(uuid) => handleDeleteQuestion(uuid, questions)}
                loadingQuestions={loadingQuestions}
                hostMessage={hostMessage}
                roundNumber={1}
                isHost={roomData?.isHost || false}
              />
            </div>
          </div>
          {/* Show chat button for mobile view */}
          <div className="lg:hidden w-full">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center gap-3 bg-white rounded-xl"
              onClick={toggleMobileChat}
            >
              <MessagesSquare size={18} />
              View Chat ({messages.length})
              <FaAngleUp className={showMobileChat ? "rotate-180 transition-transform" : "transition-transform"} />
            </Button>
          </div>
          <div className="lg:flex lg:w-1/3 w-full gap-2 flex-col my-2">
            {
              roomData?.isHost && (
                <HostController
                  roomName={roomName}
                  handleGroupQuestions={handleGroupQuestions}
                  handleClearQuestion={handleClearQuestion}
                  handleRestartRound={handleRestartRound}
                  handleCloseRoom={handleCloseRoom}
                  handleShowQR={() => setShowQRDialog(!showQRDialog)}
                />
              )
            }

            <div className='h-1/3 lg:h-1/2 lg:flex-grow hidden lg:block bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto' id='chat-container'>
              <ChatWindow
                messages={messages}
                participants={participants}
              />

              <div className="lg:hidden">
                <Button variant="outline" className="lg:hidden flex-shrink text-gray-500 flex justify-between items-center gap-3"> <FaAngleUp /> more chat</Button>
              </div>
            </div>
            {
              !roomData?.isHost && (
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

        <UsernameDialog
          open={showUsernameDialog}
          onOpenChange={(open) => setShowUsernameDialog(open)}
          handleUsernameSubmit={handleUsernameSubmit}
        />

        <RestartRoomDialog
          isOpen={showRestartRoomDialog}
          onOpenChange={setShowRestartRoomDialog}
          onConfirm={confirmRestartRound}
          givenQuestions={GIVEN_QUESTIONS}
          givenUpvotes={GIVEN_UPVOTES}
        />

        <CloseRoomDialog
          isOpen={showCloseRoomDialog}
          onOpenChange={setShowCloseRoomDialog}
          onConfirm={confirmCloseRoom}
        />

        <Dialog open={showMessageInput} onOpenChange={setShowMessageInput}>
          <DialogContent>
            <p className="text-xl font-bold text-black">Ask a question (1 left)</p>
            <MessageInput onSent={onSent} />
            <Button variant="secondary" onClick={() => setShowMessageInput(false)} className="mt-4 w-full">Close</Button>
          </DialogContent>
        </Dialog>

        <SubmitFeedbackDialog
          roomId={roomData?.id}
          isOpen={roomClosed}
          onOpenChange={setRoomClosed}
        />

        {/* Add the host offline dialog */}
        <Dialog open={username !== null && !hostOnline && !roomClosed}>
          <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-center text-red-600">Waiting for host</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center">
                Waiting for host to start the room ...
              </p>
            </div>
            <Image alt="Loading animation" width={600} height={400} src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDF3MnN5cG1hZXNmcmoybWhpb3hudHp1YjgwcHBlc3gxYnMwZHQyNyZlcD12MV9pbnRlcm5naWZfYnlfaWQmY3Q9Zw/QBd2kLB5qDmysEXre9/giphy.gif" />
          </DialogContent>
        </Dialog>

        {/* Mobile Chat Dialog */}
        <Dialog open={showMobileChat} onOpenChange={setShowMobileChat}>
          <DialogContent className="sm:max-w-[95%] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Live chat ({messages.length} asked)</span>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-grow overflow-y-auto my-4">
              <ChatWindow
                messages={messages}
                participants={participants}
              />
            </div>

            <DialogFooter>
              {!roomData?.isHost && questionsLeft > 0 && (
                <Button
                  onClick={handleQuestionButtonClick}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Ask a Question ({questionsLeft} left)
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoomProvider>
  );
}

export default RoomPage;