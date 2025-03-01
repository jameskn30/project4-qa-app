import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';

interface RestartRoomDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  givenQuestions: number;
  givenUpvotes: number;
}

const RestartRoomDialog: React.FC<RestartRoomDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  givenQuestions,
  givenUpvotes
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex gap-2 justify-center text-xl'>
            <Skull className="h-5 w-5" />
            Confirm Start New Q&A Round
          </DialogTitle>
        </DialogHeader>
        <p className="mt-4">Are you sure you want to start a new round?</p>
        <p className="mt-4">All users questions will be archived and everyone will have <br /> 
          <span className="bg-orange-200"> {givenQuestions} questions </span>and 
          <span className="bg-orange-200"> {givenUpvotes} upvotes</span> again 
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <Button variant="destructive" onClick={onConfirm}>Yes, Restart</Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestartRoomDialog;