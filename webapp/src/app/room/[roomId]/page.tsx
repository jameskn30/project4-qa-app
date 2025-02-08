'use client'
import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';
import { useState, useEffect } from 'react';
import { RoomProvider } from '@/app/room/[roomId]/RoomContext';
import { isRoomExists } from '@/utils/room';
import { useRouter, useParams } from 'next/navigation';
import Loading from './loading'

const RoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //render the loading 
    const checkRoomExists = async () => {
      if (!roomId || !(await isRoomExists(roomId))) {
        router.push('/404');
        throw new Error(`Room ${roomId} not found`);
      }
      setLoading(false)
    };

    checkRoomExists();
  }, [roomId, router]);

  if (loading){
    return <Loading/>
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
            <ChatWindow />
          </div>
        </div>
      </div>
    </RoomProvider>
  );
}

export default RoomPage;