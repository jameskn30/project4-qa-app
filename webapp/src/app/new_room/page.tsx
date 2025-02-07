'use client'
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useQRCode } from 'next-qrcode';
import { FaPlus } from 'react-icons/fa6';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"


const NewRoomPage = () => {


    const { Canvas } = useQRCode()

    const [roomId, setRoomId] = useState('');

    const handleJoinRoom = () => {
        // Logic to join the room by room_id
        console.log(`Joining room with ID: ${roomId}`);
    };

    return (
        <div className="flex items-center flex-col justify-center h-screen bg-gradient-to-r from-blue-300 to-purple-400 gap-3">
            <h1 className="text-2xl">Hello world</h1>
            <Tabs defaultValue="account" className="w-[300px] flex justify-center flex-col items-center">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <div className="bg-white bg-opacity-80 p-10 rounded-lg 
                    shadow-lg text-center border-2 border-slate-100 w-[300px] h-[300px]">
                        <h1 className="text-3xl font-bold mb-6">Join new room</h1>
                        <p className="text-sm mb-6">Or you can scan QR code</p>
                        <div className="flex gap-2 w-full flex-col">
                            <Input
                                type="text"
                                placeholder="Enter Room ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="mb-4 w-full bg-white"
                            />
                            <button
                                onClick={handleJoinRoom}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                            >
                                Join
                            </button>
                        </div>
                    </div>

                </TabsContent>
                <TabsContent value="password">

                    <div id="create-qr" className="bg-white items-center bg-opacity-80 
                    p-5 rounded-lg text-center border-2 border-slate-100 max-w-sm w-[300px] h-[300px]">
                        <p className="text-2xl font-bold mb-4 flex justify-center items-center gap-2">Create your room <span><FaPlus /></span></p>
                        <p className="text-sm ">Scan this QR</p>
                        <div className='flex justify-center'>
                            <Canvas
                                text={'https://github.com/bunlong/next-qrcode'}
                                options={{
                                    errorCorrectionLevel: 'M',
                                    margin: 3,
                                    scale: 4,
                                    width: 200,
                                    color: {
                                        dark: '#010599FF',
                                        light: '#FFBF60FF',
                                    },
                                }}
                            />

                        </div>

                    </div>

                </TabsContent>
            </Tabs>


        </div>
    );
};

export default NewRoomPage;
