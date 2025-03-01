import { Skull } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface CloseRoomDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const CloseRoomDialog: React.FC<CloseRoomDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          This action will save your activities (questions, messages, ...) and will kick all participants out. It cannot be undone</p>
        <div className="mt-4 flex justify-center gap-4">
          <Button variant="destructive" onClick={onConfirm}>Yes, Close Room</Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CloseRoomDialog;
