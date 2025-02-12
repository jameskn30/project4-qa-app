'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useQRCode } from 'next-qrcode';
import { FaRandom } from "react-icons/fa";
import { Toaster, toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import { isRoomExists } from '@/utils/room';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { createClient } from '@/utils/supabase/component'
import Loading from './loading'
import { signout } from '@/app/utils/auth';

const NavBar = ({handleSignOut}:{handleSignOut: () => void}) => {

    return (
        <nav className="top-4 w-full flex justify-between py-3 gap-3 px-3 z-10 md:px-10 lg:px-36">
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
                <a href="/" className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">⚡ Bolt.qa</a>
            </div>
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
                <div className='flex gap-2'>
                    <div className="bg-slate-200 rounded-xl py-1 px-2 flex">
                        <p>Username here</p>
                    </div>
                    <button onClick={handleSignOut} className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Logout</button>
                </div>
            </div>
        </nav>
    )
}

const NewRoomPage = () => {
    const [roomId, setRoomId] = useState(null);
    const [roomIdInput, setRoomIdInput] = useState('');
    const [joiningLoader, setJoiningLoader] = useState(false);
    const [fetchingRandomRoomId, setFetchingRandomRoomId] = useState(false);
    const router = useRouter();

    const supabase = createClient()
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const { Canvas } = useQRCode();

    const handleSignOut = async () => {
        await signout();
        router.push('/');
    };

    const fetchRoomId = useCallback(_.debounce(async () => {
        try {
            console.log('fetched room id ');
            const response = await fetch('/chatapi/get_random_room_id');
            const data = await response.json();
            setRoomId(data.roomId);
        } catch (error) {
            console.error('Error fetching room ID:', error);
        } finally {
            setFetchingRandomRoomId(false);
        }
    }, 1000), []);

    const handleFetchRandomId = () => {
        setFetchingRandomRoomId(true);
        fetchRoomId();
    };

    const handleStartRoom = useCallback(_.debounce(async () => {
        if (roomId === null) return;
        try {
            const roomExists = await isRoomExists(roomId);
            if (roomExists) {
                router.push(`/room/${roomId}`);
                toast.success('Room created successfully');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error('Error creating room');
        }
    }, 1000), [roomId]);

    const handleJoinRoom = async () => {
        if (!roomIdInput || roomIdInput === '') {
            toast.error('Please enter a room ID');
            return;
        }

        setJoiningLoader(true);

        try {
            const response = await fetch('/chatapi/room_exists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId: roomIdInput }),
            });

            if (response.ok) {
                router.push(`/room/${roomIdInput}`);
            } else {
                toast.error('Room does not exist');
            }
        } catch (e) {
            toast.error('Unexpected error');
        } finally {
            setJoiningLoader(false);
        }
    };

    useEffect(() => {

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setAuthLoading(false);
        };

        checkUser();

        console.log('isLoggedIn ' + isLoggedIn)

    }, [supabase])


    if (authLoading) {
        return <Loading />
    }

    return (
        <div className="flex items-center flex-col h-screen bg-gradient-to-r from-white to-purple-200 gap-3">
            <NavBar handleSignOut={handleSignOut} />
            <Toaster expand={true} position='top-center' richColors />
            <div className="w-full h-full flex justify-center items-center">
                <Tabs defaultValue="account" className="w-[350px] flex justify-center flex-col items-center">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="account">Join Room</TabsTrigger>
                        <TabsTrigger value="password" onClick={() => {
                            if (roomId === null) {
                                handleFetchRandomId();
                            }
                        }}>New Room</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <div className="bg-white bg-opacity-80 p-5 rounded-lg justify-center items-center shadow-lg text-center border-2 border-slate-100 w-[350px] h-[350px]">
                            <h1 className="text-3xl font-bold mb-6">Join new room</h1>
                            <p className="text-sm mb-6">Or you can scan QR code</p>
                            <div className="flex gap-2 w-full flex-col">
                                <Input
                                    type="text"
                                    placeholder="Enter Room ID"
                                    value={roomIdInput}
                                    onChange={(e) => setRoomIdInput(e.target.value)}
                                    className="mb-4 w-full bg-white"
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleJoinRoom}
                                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                                    >
                                        Join
                                    </button>
                                    {joiningLoader && <Spinner />}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="password">
                        <div className="bg-white bg-opacity-80 p-2 rounded-lg gap-4 flex flex-col justify-center shadow-lg text-center border-2 border-slate-100 w-[350px] h-[350px]">
                            {fetchingRandomRoomId && <Spinner />}
                            {!fetchingRandomRoomId && (
                                <>
                                    <div className="flex gap-3 justify-center">
                                        <p className="text-4xl flex-1 text-center">{roomId}</p>
                                        <button className="rounded-lg border-2 border-transparent hover:border-slate-300 px-2" onClick={handleFetchRandomId}>
                                            <FaRandom />
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
                                </>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

        </div>
    );
};

export default NewRoomPage;
