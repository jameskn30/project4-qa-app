'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useQRCode } from 'next-qrcode';
import { IoMdRefresh } from "react-icons/io";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

const NewRoomPage = () => {
    const [roomId, setRoomId] = useState('');

    const fetchRoomId = useCallback(async () => {
        try {
            console.log('fetched room id ')
            const response = await fetch('/chatapi/get_random_room_id');
            const data = await response.json();
            setRoomId(data.roomId);
        } catch (error) {
            console.error('Error fetching room ID:', error);
        }
    }, []);

    useEffect(() => {
        fetchRoomId();
    }, []);

    const { Canvas } = useQRCode();

    const handleJoinRoom = () => {
        console.log(`Joining room with ID: ${roomId}`);
    };

    const handleRefreshName = () => {
        fetchRoomId();
    };

    return (
        <div className="flex items-center flex-col justify-center h-screen bg-gradient-to-r from-blue-300 to-purple-400 gap-3">
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
                                onClick={handleJoinRoom}
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
                            <p className="text-4xl flex-1 ">{roomId} </p>
                            <button className="rounded-lg border-2 border-transparent hover:border-slate-300 px-2"
                            onClick={handleRefreshName}
                            >
                                <IoMdRefresh/>
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
                            onClick={handleJoinRoom}
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
