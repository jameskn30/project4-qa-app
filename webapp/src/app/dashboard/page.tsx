'use client'

// React and Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

// Third-party imports
import { toast, Toaster } from 'sonner';
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
import {HardDriveDownload, ThumbsUp, UserRound } from 'lucide-react';
import { fetchMyRooms, fetchFeedback } from '@/utils/room.v2';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Define a type for feedback item
interface FeedbackItem {
    feedback: string;
    username: string;
    like: boolean;
    created_at: string;
    email: string;
    phone_number: string;
}

// Define a type for room data
interface RoomData {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    // Add other room properties as needed
}

const NewRoomPage = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const [userData, setUserData] = useState<UserData | null>(null)
    const [activeRoom, setActiveRoom] = useState<RoomData | null>(null)

    const [pastRooms, setPastRooms] = useState<RoomData[]>([])
    const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

    // Add state for feedback data
    const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const user = await _getUserData()
                console.log(user)
                setUserData(user)
                setIsLoggedIn(!!user)
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setAuthLoading(false)
            }
        }

        const getActiveRooms = async () => {
            try {
                const data = await fetchMyRooms() as RoomData[]
                
                const pastRooms: RoomData[] = []

                data.forEach((room) => {
                    if (room.is_active) {
                        setActiveRoom(room)
                    } else {
                        pastRooms.push(room)
                    }
                })
                setPastRooms(pastRooms)
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        }

        getUserData()
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
        if (activeRoom) {
            router.push(`/room/${activeRoom.name}`)
        }
    }

    const handleViewStats = async (room: RoomData) => {
        setSelectedRoom(room);
        setIsLoadingFeedback(true);
        console.log('room data = ', room)

        try {
            // Fetch feedback data for the selected room
            const feedback = await fetchFeedback(room.name);
            setFeedbackData(feedback);
        } catch (error) {
            console.error("Error fetching feedback:", error);
            setFeedbackData([]);
        } finally {
            setIsLoadingFeedback(false);
            setIsStatsDialogOpen(true);
        }
    };

    // Calculate feedback statistics
    const totalFeedback = feedbackData.length;
    const totalLikes = feedbackData.filter(item => item.like).length;
    const likePercentage = totalFeedback > 0 ? Math.round((totalLikes / totalFeedback) * 100) : 0;

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
            </div>

            {/* <div className="container mx-auto px-4"> */}
            <div className='flex justify-center items-center w-1/2'>
                <p className="w-auto text-lg font-bold mx-4">Past rooms</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {pastRooms.map((room) => (
                    <div className='w-[250px] h-[250px]' key={room.id}>
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Room Statistics - {selectedRoom?.name}</DialogTitle>
                        <DialogDescription>
                            Detailed analytics for your Q&A session
                        </DialogDescription>
                    </DialogHeader>

                    {/* Feedback Section */}
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Participant Feedback
                                {isLoadingFeedback && <span className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></span>}
                            </CardTitle>
                            <CardDescription>
                                <Button variant="outline" onClick={() => toast.error("Feature still in development")}><HardDriveDownload/> Export CSV</Button>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {feedbackData.length > 0 ? (
                                <>
                                    {/* Feedback Summary */}
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Responses</p>
                                                <p className="text-2xl font-bold">{totalFeedback}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Likes</p>
                                                <p className="text-2xl font-bold flex items-center justify-center">
                                                    {totalLikes} <ThumbsUp className="ml-2 text-green-500" size={18} />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Like rates</p>
                                                <p className="text-2xl font-bold">{likePercentage}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback Table */}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Participant</TableHead>
                                                <TableHead className="w-[500px]">Feedback</TableHead>
                                                <TableHead>Like</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Phone number</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {feedbackData.map((item, id) => (
                                                <TableRow key={id}>
                                                    <TableCell className="font-medium">{item.username || 'Anonymous'}</TableCell>
                                                    <TableCell>{item.feedback || '-'}</TableCell>
                                                    <TableCell>
                                                        {item.like ?
                                                            <ThumbsUp className="text-green-500" size={16} /> :
                                                            '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell>{item.email || '-'}</TableCell>
                                                    <TableCell>{item.phone_number || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {isLoadingFeedback
                                        ? "Loading feedback data..."
                                        : "No feedback submitted for this room"}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NewRoomPage;
