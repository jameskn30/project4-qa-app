import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UsernameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleUsernameSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const UsernameDialog: React.FC<UsernameDialogProps> = ({
  open,
  onOpenChange,
  handleUsernameSubmit
}) => {
  const [usernameInput, setUsernameInput] = useState<string>('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your name? ☺️</DialogTitle>
        </DialogHeader>
        <DialogDescription>Enter username dialog</DialogDescription>
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
  );
};

export default UsernameDialog;
