'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { MessagesSquare, ChartColumnBig, ScanQrCode, Trash, Copy } from 'lucide-react';
import { FaRegComments, FaTrashCan, FaArrowRotateRight, FaSquarePollVertical } from "react-icons/fa6";
import ShowRoomQRDialog from './ShowRoomQRDialog';

interface HostControllerProps {
  roomName: string | null;
  handleGroupQuestions: () => void;
  handleClearQuestion: () => void;
  handleRestartRound: () => void;
  handleCloseRoom: () => void;
  handleShowQR: () => void;
}
const HostController: React.FC<HostControllerProps> = ({
  roomName,
  handleGroupQuestions,
  handleClearQuestion,
  handleRestartRound,
  handleCloseRoom,
}) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomName}` : '';

  return (
    <div className="w-full" id='host-control-container'>
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
            <Button onClick={() => setShowQRDialog(true)} className='text-center w-full mb-2 bg-green-700 text-white hover:bg-green-700 font-bold flex'><ScanQrCode /> Show room QR</Button>
            <Button variant="destructive" className='text-center w-full mb-2 font-bold flex' onClick={handleCloseRoom}><Trash /> Close room</Button>
          </CardDescription>
        </CardContent>
      </Card>
      <ShowRoomQRDialog
        urlToEncode={roomUrl}
        title={roomName || 'Room QR Code'}
        open={showQRDialog}
        setOpen={setShowQRDialog}
      />
    </div>
  );
};

export default HostController;
