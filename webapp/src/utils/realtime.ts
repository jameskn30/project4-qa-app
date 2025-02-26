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

export interface Participant {
  username: string;
  isHost: boolean;
  online: boolean;
  // id?: string; // Optional unique identifier
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
  setParticipants: (participants: Participant[]) => void;
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
  sendDeleteQuestions: (questionid: string) => Promise<void>;
  getParticipants: () => Participant[];
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
    setRoomClosed,
    setParticipants
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
    //Only host allowed to update Postgres DB
    if (roomData?.isHost) {
      addMessage(roomData.id, content, username, 1);
    }
  });

  // Handle questions
  channel.on('broadcast', { event: 'questions' }, ({ payload }: { payload: any }) => {
    setQuestions(payload.questions.map(
      (question: { uuid: string, rephrase: string, upvotes: number }) => ({
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

    // This is redundant since we're already updating upvotesLeft in the component
    if (roomData?.isHost) {
      setUpvotesLeft(prev => prev - 1);
    }
  });

  // Handle commands with switch statement
  channel.on('broadcast', { event: 'command' }, ({ payload }: { payload: any }) => {
    switch (payload.command) {
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

  // Function to extract participants from presence state
  const extractParticipants = (state: any): Participant[] => {
    if (state){
    return Object.values(state)
      .flat()
      .map((presence: any) => ({
        username: presence.username,
        isHost: presence.isHost,
        online: presence.online,
        // id: presence.id || `user-${Math.random().toString(36).substr(2, 9)}`
      }));
    }
    return []
  };

  // Presence handling with participants tracking
  channel
    .on("presence", { event: 'sync' }, () => {
      // If user is host, no need to check presence
      if (roomData.isHost) {
        setHostOnline(true);
      }

      // Update participants list based on presence data
      const presences = channel.presenceState();
      const participants = extractParticipants(presences);
      setParticipants(participants);
      
      // Check if host is in the room
      setHostOnline(participants.some(p => p.isHost === true));
    })
    .on("presence", { event: 'join' }, ({ newPresences, state }: { key: string, newPresences: any[], state: any }) => {
      const participants = extractParticipants(state);
      setParticipants(participants);
      
      if (roomData.isHost) return;

      if (newPresences.some((presence: any) => presence.isHost === true)) {
        setHostOnline(true);
      }
    })
    .on("presence", { event: 'leave' }, ({ leftPresences, state }: { key: string, leftPresences: any[], state: any }) => {
      const participants = extractParticipants(state);
      setParticipants(participants);
      
      if (roomData.isHost) return;

      if (leftPresences.some((presence: any) => presence.isHost === true)) {
        setHostOnline(false);
      }
    });

  // Subscribe and track presence
  channel.subscribe(async (status: string) => {
    if (status === 'SUBSCRIBED') {
      const presenceData = {
        username,
        isHost: roomData.isHost,
        online: true,
        id: `user-${Math.random().toString(36).substr(2, 9)}`
      };

      await channel.track(presenceData);

      if (roomData.isHost) {
        setHostOnline(true);
      }
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

  const sendDeleteQuestions = async (questionId: string) => {
    // Implementation for deleting questions
  };

  const sendCommand = async (command: string) => {
    await channel.send({
      type: 'broadcast',
      event: 'command',
      payload: { command }
    });
  };

  const broadcastQuestions = async (questions: QuestionItem[]) => {
    if (roomData?.isHost) {
      await channel.send({
        type: 'broadcast',
        event: 'questions',
        payload: { questions }
      });

      updateQuestionsOnDb(questions);
    }
  };

  // Function to get current participants
  const getParticipants = (): Participant[] => {
    return extractParticipants(channel.presenceState());
  };

  // Return the channel and utility functions
  return {
    channel,
    sendMessage,
    sendUpvote,
    sendDeleteQuestions,
    sendCommand,
    broadcastQuestions,
    unsubscribe: () => channel.unsubscribe(),
    getParticipants
  };
};

// Helper to check if the host is online based on presence data
export const isHostOnline = (presenceState: any, isCurrentUserHost: boolean): boolean => {
  if (isCurrentUserHost) return true;

  const presences = Object.values(presenceState).flat();
  return presences.some((presence: any) => presence.isHost === true);
};