'use client'
import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import {
    getActiveRooms as _getActiveRooms,
    createRoom as _createRoom,
    fetchRoomId as _fetchRoomId
} from '@/utils/room.v2'
import {
    getUserData as _getUserData,
    UserData
} from '@/utils/supabase/auth'
import { FaCirclePlus } from "react-icons/fa6";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Loading from './loading'
import { signout } from '@/utils/supabase/auth';
import JoinRoomForm from '../components/JoinRoomForm';
import CreateRoomForm from '../components/CreateRoomForm';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { UserRound } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const NewRoomPage = () => {
    const [roomId, setRoomId] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const [userData, setUserData] = useState<UserData | null>(null)
    const [activeRoom, setActiveRoom] = useState<boolean>(false)

    useEffect(() => {

        const getUserData = async () => {
            const user = await _getUserData()
            console.log(user)
            setUserData(user)
            setIsLoggedIn(!!user)
            setAuthLoading(false)
        }

        getUserData()

        const getActiveRooms = async () => {
            const data = await _getActiveRooms()
            if (data) {
                setActiveRoom(true)
                setRoomId(data.roomId)
            } else {
                console.log('no active rooms')
            }
        }

        getActiveRooms()

    }, [])


    const handleSignOut = async () => {
        setIsLoggingOut(true);
        await signout();
        setIsLoggingOut(false);
        router.push('/');
    };

    const onCloseCreateRoom = () => {
        setIsDialogOpen(false)
    }

    const goToHomepage = () => {
        router.push('/')
    }

    const handleJoinActiveRoom = () => {
        router.push(`/room/${roomId}`)
    }


    if (authLoading) {
        return <Loading />
    }

    return (
        <div className="flex items-center flex-col min-h-screen bg-gradient-to-r from-white to-blue-200 gap-3 overflow-y-auto h-auto overflow-x-hidden">
            <Navbar
                userData={userData}
                login={() => console.log('nav bar login')}
                signOut={handleSignOut}
                signUp={() => console.log('nav bar sign up')}
            />
            <Toaster expand={true} position='top-center' richColors />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className='w-[250px] h-[250px]'>
                    <JoinRoomForm />
                </div>
                {
                    activeRoom && (
                        <div className='w-[250px] h-[250px]'>
                            <Card className="w-full h-full flex flex-col justify-center items-center hover:bg-slate-100 hover:cursor-pointer">
                                <CardHeader className='text-2xl'>
                                    <CardTitle>{roomId} </CardTitle>

                                    <CardDescription className="flex items-center gap-2">
                                        LIVE<span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex-1 flex flex-col justify-center w-full'>
                                    <div className='flex p-3'>
                                        <UserRound/>
                                        <p>participants: 50</p>
                                    </div>
                                    <Button className="bg-blue-500 text-white hover:bg-blue-700" onClick={handleJoinActiveRoom}>
                                        Join room
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    )
                }
                {
                    !activeRoom && (
                        <div className='w-[250px] h-[250px]'>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Card className="w-full h-full flex flex-col justify-center items-center hover:bg-slate-100 hover:cursor-pointer">
                                        <CardHeader className='text-2xl'>
                                            <CardTitle>Create room </CardTitle>
                                        </CardHeader>
                                        <CardContent className='flex-1 flex flex-col justify-center items-center'>
                                            <FaCirclePlus size={60} />
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Room</DialogTitle>
                                        <DialogDescription>
                                            Set up a new room for your Q&A session
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CreateRoomForm onClose={onCloseCreateRoom} />
                                </DialogContent>
                            </Dialog>
                        </div>

                    )
                }

                {/* <div className='w-[250px] h-[250px]'>
                    <Card className="w-full h-full flex flex-col justify-center items-center hover:bg-slate-100 hover:cursor-pointer">
                        <CardHeader className='text-2xl flex'>
                            <CardTitle className='flex gap-2'>
                                Add polls
                                <ChartColumnBig />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='flex-1 flex flex-col justify-center'>
                            <p>You have 3 preset polls</p>
                        </CardContent>
                    </Card>
                </div> */}
            </div>

            {/* TODO:  add more features after MVP */}
            {/* <div className='flex justify-center items-center w-1/2'>
                <p className="w-auto text-lg font-bold mx-4">Past rooms</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                    <Card className='w-[250px] h-[250px]'>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    <Card className='w-[250px] h-[250px]'>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </div>

                <div>
                    <Card className='w-[250px] h-[250px]'>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    <Card className='w-[250px] h-[250px]'>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </div>

                <div>
                    <Card className='w-[250px] h-[250px]'>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </div>

            </div> */}
        </div>
    );
};

export default NewRoomPage;
