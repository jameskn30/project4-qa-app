import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { isRoomExists } from '@/utils/room.v2';

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
            //TODO: testing supabase realtime
            router.push(`/room/${roomCode}`);
            // const res = await isRoomExists(roomCode)
            // if (res) {
            //     console.log('room exists')
            //     router.push(`/room/${roomCode}`);
            // } else {
            //     const msg = `Room ${roomCode} does not exist`
            //     toast.error(msg);
            //     console.error(msg)
            // }
        } catch (err) {
            console.error(err)
        } finally {
            setJoiningLoader(false);
        }
    };

    return (
        <Card className="shadow-lg bg-white w-full h-full p-3 flex justify-center items-center">
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold mb-6">Join new room</h1>
                    <Label htmlFor="roomCode" className="text-lg font-medium">Enter Room Code:</Label>
                    <Input
                        type="text"
                        name="roomCode"
                        id="roomCode"
                        placeholder="Room Code"
                    />
                    <Button type="submit" disabled={joiningLoader} className="bg-blue-500 text-white hover:bg-blue-700">
                        {joiningLoader ? <Spinner /> : 'Join Room'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default JoinRoomForm;
