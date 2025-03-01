'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utils
// import { submitFeedback } from '@/utils/room.v2';

interface SubmitFeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string | undefined;
}

const SubmitFeedbackDialog: React.FC<SubmitFeedbackDialogProps> = ({
  isOpen,
  onOpenChange,
  roomId,
}) => {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleFormSubmit = async () => {
  // const handleFormSubmit = async (formData: FormData) => {
    try {
    //   await submitFeedback(formData);
      toast.success("Feedback submitted. Redirecting to home page");
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      toast.error("Some error happened, please close this tab");
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Room closed by host</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" action={handleFormSubmit}>
          <div className="flex gap-3 flex-col">
            <p className="mb-2">You can leave feedback, follow-up questions, or let us know how you liked the session.</p>

            <div className="flex justify-center gap-4 items-center mb-2">
              <p>Did you find this session helpful?</p>
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

            <input name="roomId" id="roomId" className='hidden' value={roomId || ''} />

            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Your feedback (optional)
              </label>
              <Input
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any feedback or follow-up question?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address (optional)
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone number (optional)
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(123) 456-7890"
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
  );
}

export default SubmitFeedbackDialog;