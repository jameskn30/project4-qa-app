'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Shuffle } from 'lucide-react';
import { useQRCode } from 'next-qrcode';
import { useRouter } from 'next/navigation'
import { fetchRoomId } from '@/utils/room.v2'
import { createRoom as _createRoom } from '@/utils/room.v2';
import { Toaster, toast } from 'sonner'
import _ from 'lodash';


const CreateRoomForm = ({ onClose }: { onClose: () => void }) => {
    const [fetchingRandomRoomId, setFetchingRandomRoomId] = useState(false);
    const [roomId, setRoomId] = useState('loading');
    const [activeRoom, setActiveRoom] = useState(false);
    const router = useRouter();
    const { Canvas } = useQRCode();

    const handleStartRoom = useCallback(_.debounce(async () => {
        console.log(`handleStartRoom`)
        if (roomId === null) return;
        _createRoom(roomId as string)
            .then(data => {
                router.push(`/room/${roomId}`)
            })
            .catch(err => {
                console.error(err);
                toast.error('Error while creating room');

            })
    }), [roomId])

    useEffect(() => {
        handleFetchRandomId()
    }, [])

    const handleFetchRandomId = async () => {
        setFetchingRandomRoomId(true);
        const data = await fetchRoomId()
        setRoomId(data.roomId)
        setFetchingRandomRoomId(false);
    };
    return (
        <Card  className="border-0 shadow-none  bg-white p-2 gap-4 flex flex-col min-w-[350px] min-h-[400px] py-5 z-10">
            {fetchingRandomRoomId ? <Spinner /> :
                <>
                    <div className="flex gap-3 justify-center">
                        <p className="text-4xl flex-1 text-center">{roomId}</p>
                        {
                            !activeRoom && (
                                <Button
                                    variant={'ghost'}
                                    className="rounded-lg border-2 border-transparent hover:border-slate-300 px-2 bg-white border-none"
                                    onClick={handleFetchRandomId}>
                                    <Shuffle/>
                                </Button>
                            )
                        }
                    </div>
                    <div className='flex justify-center'>
                        <Canvas
                            text={`${URL}/${encodeURIComponent(roomId!!)}`}
                            options={{
                                errorCorrectionLevel: 'M',
                                margin: 3,
                                scale: 4,
                                width: 200,
                                color: {
                                    dark: '#000000', // Black
                                    light: '#FFFFFF', // White
                                },
                            }}
                        />
                    </div>
                    <div className='flex gap-2 flex-col mx-10'>
                        <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 "
                            onClick={handleStartRoom}>
                            Start room
                        </Button>
                        <Button variant={"destructive"}
                            onClick={onClose}>
                            Cancel
                        </Button>

                    </div>
                </>
            }
            <Toaster richColors position={"top-center"} />
        </Card>

    )
}

export default CreateRoomForm;