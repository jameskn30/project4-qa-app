import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

const JoinRoomForm = () => {
    const router = useRouter();
    const [joiningLoader, setJoiningLoader] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const roomCode = formData.get('roomCode') as string;
        
        console.log('roomCode ' + roomCode)

        if (roomCode.trim() === '') {
            toast.error('Room code cannot be empty');
            return;
        }

        setJoiningLoader(true);

        try {
            const response = await fetch('/chatapi/room_exists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId: roomCode }),
            });

            if (response.ok) {
                router.push(`/room/${roomCode}`);
            } else {
                toast.error('Room does not exist');
            }
        } catch (e) {
            toast.error('Unexpected error');
        } finally {
            setJoiningLoader(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="shadow-lg rounded-lg bg-white p-6">
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <h1 className="text-3xl font-bold mb-6">Join new room</h1>
                        <Label htmlFor="roomCode" className="text-lg font-medium">Enter Room Code:</Label>
                        <Input
                            type="text"
                            name="roomCode"
                            id="roomCode"
                            placeholder="Room Code"
                        />
                        <Button type="submit" variant="primary" className="mt-2" disabled={joiningLoader} 
                        className="bg-blue-500 text-white hover:bg-blue-700 ">
                            {joiningLoader ? <Spinner /> : 'Join Room'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default JoinRoomForm;
