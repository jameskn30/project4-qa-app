'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { useQRCode } from 'next-qrcode';
import { FaRandom } from "react-icons/fa";
import { Toaster, toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
// import { createRoom } from '@/utils/room';

import {getActiveRooms as _getActiveRooms, createRoom as _createRoom} from '@/utils/room.v2'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { createClient } from '@/utils/supabase/component'
import Loading from './loading'
import { signout } from '@/utils/supabase/auth';
import { Button } from '@/components/ui/button';
import JoinRoomForm from '../components/JoinRoomForm';
import { Card } from '@/components/ui/card';
import { getUserData as _getUserData, UserData } from '@/utils/supabase/auth'

const NavBar = ({ userdata, handleSignOut, isLoggingOut }: { userdata: UserData | null, handleSignOut: () => void, isLoggingOut: boolean }) => {

    return (
        <nav className="top-4 w-full flex justify-between py-3 gap-3 px-3 z-10 md:px-10 lg:px-36">
            <div className="flex p-1 space-2 bg-white shadow-xl rounded-2xl border border-slate-200">
                <Button variant={'ghost'} className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl bg-white border-none">⚡ Bolt.qa</Button>
            </div>
            <div className='flex gap-2 p-3'>
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>
                            {userdata ? userdata.username : "Loading ..."}
                        </MenubarTrigger>
                        <MenubarContent >
                            <MenubarItem>
                                email: {userdata ? userdata.email : "Loading ..."}
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Settings</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>

                <Button variant={"destructive"} onClick={handleSignOut} disabled={isLoggingOut}>
                    {isLoggingOut ? <Spinner /> : "Logout"}
                </Button>
            </div>
        </nav>
    )
}

const NewRoomPage = () => {
    const [roomId, setRoomId] = useState(null);
    const [fetchingRandomRoomId, setFetchingRandomRoomId] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const supabase = createClient()
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const [userData, setUserData] = useState<UserData | null>(null)

    const { Canvas } = useQRCode();

    const URL = 'http://localhost:3000/room';


    useEffect(() => {

        const getUserData = async () => {
            const user = await _getUserData()
            console.log(user)
            setUserData(user)
        }

        getUserData()

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setAuthLoading(false);
        };

        checkUser();
        console.log('isLoggedIn ' + isLoggedIn)

        const getActiveRooms = async () => {
            const res = await _getActiveRooms()
            if(res){
                console.log(res)
            } else {
                console.log('no active rooms')
            }
        }

        getActiveRooms()

    }, [supabase])


    const handleSignOut = async () => {
        setIsLoggingOut(true);
        await signout();
        setIsLoggingOut(false);
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
        console.log(`handleStartRoom`)
        if (roomId === null) return;
        try {
            if (roomId !== '' && userData !== null) {
                const res = await _createRoom(roomId as string);
                if (res) {
                    router.push(`/room/${roomId}`);
                } else {
                    toast.error('Error while creating room');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Error while creating room');
        }
    }, 1000), [roomId]);

    if (authLoading) {
        return <Loading />
    }

    return (
        <div className="flex items-center flex-col h-screen bg-gradient-to-r from-white to-purple-200 gap-3">
            <NavBar handleSignOut={handleSignOut} userdata={userData} isLoggingOut={isLoggingOut} />
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
                        <JoinRoomForm />
                    </TabsContent>
                    <TabsContent value="password" id="password-tab">
                        <Card className="bg-white p-2 gap-4 flex flex-col justify-center shadow-lg text-center w-[350px] h-[350px]">
                            {fetchingRandomRoomId && <Spinner />}
                            {!fetchingRandomRoomId && (
                                <>
                                    <div className="flex gap-3 justify-center">
                                        <p className="text-4xl flex-1 text-center">{roomId}</p>
                                        <Button variant={'ghost'} className="rounded-lg border-2 border-transparent hover:border-slate-300 px-2 bg-white border-none" onClick={handleFetchRandomId}>
                                            <FaRandom />
                                        </Button>
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
                                    <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 mx-10" onClick={handleStartRoom}>
                                        Start room
                                    </Button>
                                </>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default NewRoomPage;
