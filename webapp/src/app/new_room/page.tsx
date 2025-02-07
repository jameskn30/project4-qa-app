'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useQRCode } from 'next-qrcode';
import { FaRandom } from "react-icons/fa";
import { Toaster, toast } from 'sonner';
import _ from 'lodash';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

const NewRoomPage = () => {
    const [roomId, setRoomId] = useState('');

    const fetchRoomId = useCallback(_.debounce(async () => {
        try {
            console.log('fetched room id ')
            const response = await fetch('/chatapi/get_random_room_id');
            const data = await response.json();
            setRoomId(data.roomId);
        } catch (error) {
            console.error('Error fetching room ID:', error);
        }
    }, 1000), []);

    const handleStartRoom = useCallback(_.debounce(async () => {
        try {
            const response = await fetch('/chatapi/room_exists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId: roomId }),
            });

            if (response.ok) {
                toast.error('Room already exists');
            } else {
                const createResponse = await fetch('/chatapi/create_room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ roomId: roomId }),
                });
                const data = await createResponse.json();
                console.log('Room created:', data);
                toast.success('Room created successfully');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error('Error creating room');
        }
    }, 1000), [roomId]);

    useEffect(() => {
        fetchRoomId();
    }, [fetchRoomId]);

    const { Canvas } = useQRCode();

    const handleRefreshName = () => {
        fetchRoomId();
    };

    return (
        <div className="flex items-center flex-col justify-center h-screen bg-gradient-to-r from-blue-300 to-purple-400 gap-3">
            <Toaster expand={true} position='top-center' richColors />
            <h1 className="text-2xl">Hello world</h1>
            <Tabs defaultValue="account" className="w-[350px] flex justify-center flex-col items-center">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Join Room</TabsTrigger>
                    <TabsTrigger value="password">New Room</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <div className="bg-white bg-opacity-80 p-5 rounded-lg justify-center items-center
                    shadow-lg text-center border-2 border-slate-100 w-[350px] h-[350px]">
                        <h1 className="text-3xl font-bold mb-6">Join new room</h1>
                        <p className="text-sm mb-6">Or you can scan QR code</p>
                        <div className="flex gap-2 w-full flex-col">
                            <Input
                                type="text"
                                placeholder="Enter Room ID"
                                value=""
                                onChange={(e) => setRoomId(e.target.value)}
                                className="mb-4 w-full bg-white"
                            />
                            <button
                                onClick={handleStartRoom}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="password">
                    <div className="bg-white bg-opacity-80 p-2 rounded-lg gap-4 flex flex-col justify-center
                    shadow-lg text-center border-2 border-slate-100 w-[350px] h-[350px]">
                        <div className="flex gap-3 justify-center">
                            <p className="text-4xl flex-1 text-center">{roomId}</p>
                            <button className="rounded-lg border-2 border-transparent hover:border-slate-300 px-2"
                            onClick={handleRefreshName}
                            >
                                <FaRandom/>
                            </button>
                        </div>
                        <div className='flex justify-center'>
                            <Canvas
                                text={`this is a mock https that has room id in it ${roomId}`}
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
                        <button
                            onClick={handleStartRoom}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                        >
                            Start room
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default NewRoomPage;
