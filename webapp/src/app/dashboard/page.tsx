'use client'

// React and Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

// Third-party imports
import { Toaster } from 'sonner';
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
import { UserRound, MessageCircleQuestion, MessageCircleWarning, ThumbsUp } from 'lucide-react';
import { fetchMyRooms } from '@/utils/room.v2';

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
    const [activeRoom, setActiveRoom] = useState<any>()

    const [pastRooms, setPastRooms] = useState<any[]>([])
    const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);

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
            const data = await fetchMyRooms()

            let pastRooms: any[] = []

            data.forEach((room) => {
                if (room.is_active) {
                    setActiveRoom(room)
                } else {
                    pastRooms.push(room)
                }

            })
            setPastRooms(pastRooms)
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
        router.push(`/room/${activeRoom.name}`)
    }

    const handleViewStats = (room: any) => {
        setSelectedRoom(room);
        setIsStatsDialogOpen(true);
    };

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
                                    <CardTitle>{activeRoom.name} </CardTitle>
                                    <CardDescription className="flex items-center gap-2 text-red-500 font-bold">
                                        LIVE<span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex-1 flex flex-col justify-center w-full'>
                                    <div className='flex p-3'>
                                        <UserRound />
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
                {/* TODO: add poll feature */}
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
                </div>
             */}</div>

            {/* <div className="container mx-auto px-4"> */}
            <div className='flex justify-center items-center w-1/2'>
                <p className="w-auto text-lg font-bold mx-4">Past rooms</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {pastRooms.map((room) => (
                    <div className='w-[250px] h-[250px]'>
                        <Card className="w-full h-full flex flex-col justify-center items-center hover:bg-slate-100 hover:cursor-pointer">
                            <CardHeader>
                                <CardTitle>{room.name} (closed)</CardTitle>
                                <CardDescription>
                                    started <span className='font-bold'>
                                        {format(parseISO(room.created_at), 'PPp')}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex justify-center gap-2 flex-col text-sm'>
                                    <div className='flex gap-2'>
                                        <UserRound size={18} />
                                        <p>50 participants</p>
                                    </div>

                                    <div className='flex gap-2'>
                                        <MessageCircleQuestion size={18} />
                                        <p>103 questions asked </p>
                                    </div>

                                    <div className='flex gap-2'>
                                        <MessageCircleWarning size={18} />
                                        <p>2 followups </p>
                                    </div>

                                    <div className='flex gap-2'>
                                        <ThumbsUp size={18} />
                                        <p>183 likes the session </p>
                                    </div>
                                    <Button className="bg-blue-500 text-white hover:bg-blue-700" onClick={() => handleViewStats(room)}>
                                        See stats
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Room Statistics - {selectedRoom?.name}</DialogTitle>
                        <DialogDescription>
                            Detailed analytics for your Q&A session
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Participation Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Participants:</span>
                                        <span className="font-bold">50</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Active Participants:</span>
                                        <span className="font-bold">35</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Average Engagement:</span>
                                        <span className="font-bold">75%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Question Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Questions:</span>
                                        <span className="font-bold">103</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Answered Questions:</span>
                                        <span className="font-bold">95</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Follow-ups:</span>
                                        <span className="font-bold">2</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NewRoomPage;
