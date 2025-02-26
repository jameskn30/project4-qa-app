import _ from 'lodash';
import { Message } from '@/app/components/ChatWindow';
import { QuestionItem } from '@/app/components/QuestionList';
import { addMessage, insertQuestions } from '@/utils/room.v2';

// Types for better TypeScript support
export interface RoomData {
  id: string;
  name: string;
  isHost: boolean;
}

export interface RealtimeHandlers {
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setQuestions: (questions: QuestionItem[] | ((prev: QuestionItem[]) => QuestionItem[])) => void;
  setLoadingQuestions: (loading: boolean) => void;
  setHostMessage: (message: string) => void;
  setQuestionsLeft: (questionsLeft: number | ((prev: number) => number)) => void;
  setUpvotesLeft: (upvotesLeft: number | ((prev: number) => number)) => void;
  setHostOnline: (online: boolean) => void;
  setRoomClosed: (closed: boolean) => void;
}

export interface RealtimeConfig {
  GIVEN_QUESTIONS: number;
  GIVEN_UPVOTES: number;
}

export interface RealtimeChannelApi {
  channel: any;
  sendMessage: (content: string) => Promise<void>;
  sendUpvote: (questionId: string) => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  broadcastQuestions: (questions: QuestionItem[]) => Promise<void>;
  unsubscribe: () => void;
}

export const setupRealtimeChannel = (
  supabase: any,
  roomName: string,
  roomData: RoomData,
  username: string,
  handlers: RealtimeHandlers,
  config: RealtimeConfig
): RealtimeChannelApi => {
  const {
    setMessages,
    setQuestions,
    setLoadingQuestions,
    setHostMessage,
    setQuestionsLeft,
    setUpvotesLeft,
    setHostOnline,
    setRoomClosed
  } = handlers;

  const { GIVEN_QUESTIONS, GIVEN_UPVOTES } = config;

  const channel = supabase.channel(`room-${roomName}`, {
    config: {
      broadcast: { self: true },
    }
  });

  // Handle messages
  channel.on('broadcast', { event: 'message' }, ({ payload }: { payload: any }) => {
    const { username, content } = payload;
    const message: Message = { username, content, flag: '🇺🇸' };
    setMessages((prevMessages) => [...prevMessages, message]);
    if (roomData?.isHost) {
      addMessage(roomData.id, content, username, 1);
    }
  });

  // Handle questions
  channel.on('broadcast', { event: 'questions' }, ({ payload }: { payload: any }) => {
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
    console.log('updated questions on db');
  }, 2000);

  // Handle upvotes
  channel.on('broadcast', { event: 'upvote' }, ({ payload }: { payload: any }) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = prevQuestions.map(question =>
        question.uuid === payload.questionId
          ? { ...question, upvotes: (question.upvotes || 0) + 1 }
          : question
      );

      if (roomData?.isHost) {
        updateQuestionsOnDb(updatedQuestions);
      }

      return updatedQuestions;
    });
    
    if (roomData?.isHost) {
      setUpvotesLeft(prev => prev - 1);
    }
  });

  // Handle commands
  channel.on('broadcast', { event: 'command' }, ({ payload }: { payload: any }) => {
    const { command } = payload;
    switch (command) {
      case 'clear_questions':
        setLoadingQuestions(true);
        setQuestions([]);
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
        break;
    }
  });

  // Presence handling
  channel
    .on("presence", { event: 'sync' }, () => {
      console.log('presence sync');
      const state = channel.presenceState();
      console.log('presence state', state);
      
      // Check if host is in the room
      const presences = Object.values(state).flat();
      const hostPresent = presences.some((presence: any) => presence.isHost === true);
      setHostOnline(hostPresent || roomData.isHost);
    })
    .on("presence", { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
      // When someone joins, check if they're the host
      const hostJoined = newPresences.some((presence: any) => presence.isHost === true);
      if (hostJoined) {
        console.log('Host joined the room');
        setHostOnline(true);
      }
    })
    .on("presence", { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
      // Only check for host leaving if we're not the host ourselves
      if (!roomData.isHost) {
        const hostLeft = leftPresences.some((presence: any) => presence.isHost === true);
        if (hostLeft) {
          // We need to check if there are other host instances still in the room
          const state = channel.presenceState();
          const remainingPresences = Object.values(state).flat();
          const hostStillPresent = remainingPresences.some((presence: any) => 
            presence.isHost === true && !leftPresences.includes(presence)
          );
          
          if (!hostStillPresent) {
            console.log('All hosts have left the room');
            setHostOnline(false);
          }
        }
      }
    });

  // Subscribe and track presence
  channel.subscribe(async (status: string) => {
    if (status !== 'SUBSCRIBED') return;
    
    const presenceData = { 
      username: username, 
      isHost: roomData.isHost,
      online: true,
    };
    
    const trackStatus = await channel.track(presenceData);
    console.log('trackStatus', trackStatus);
    
    // If we are the host, immediately set hostOnline to true
    if (roomData.isHost) {
      setHostOnline(true);
    }
  });

  // Helper functions for sending messages through the channel
  const sendMessage = async (content: string) => {
    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { username, content }
    });
  };

  const sendUpvote = async (questionId: string) => {
    await channel.send({
      type: 'broadcast',
      event: 'upvote',
      payload: { questionId }
    });
  };

  const sendCommand = async (command: string) => {
    await channel.send({
      type: 'broadcast',
      event: 'command',
      payload: { command }
    });
  };

  const broadcastQuestions = async (questions: QuestionItem[]) => {
    await channel.send({
      type: 'broadcast',
      event: 'questions',
      payload: { questions }
    });
  };

  // Return the channel and utility functions
  return {
    channel,
    sendMessage,
    sendUpvote,
    sendCommand,
    broadcastQuestions,
    unsubscribe: () => channel.unsubscribe()
  };
};

// Helper to check if the host is online based on presence data
export const isHostOnline = (presenceState: any, isCurrentUserHost: boolean): boolean => {
  if (isCurrentUserHost) return true;
  
  const presences = Object.values(presenceState).flat();
  return presences.some((presence: any) => presence.isHost === true);
};