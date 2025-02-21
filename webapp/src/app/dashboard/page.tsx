'use client'
import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
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
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import Loading from './loading'
import { signout } from '@/utils/supabase/auth';
import { Button } from '@/components/ui/button';
import JoinRoomForm from '../components/JoinRoomForm';
import Image from 'next/image';
import CreateRoomForm from '../components/CreateRoomForm';
import { ChartColumnBig } from 'lucide-react'


interface NavBarProps {
    userdata: UserData | null
    handleSignOut: () => void
    goToHomepage: () => void
    isLoggingOut: boolean
}

const NavBar = ({ userdata, handleSignOut, isLoggingOut, goToHomepage }: NavBarProps) => {

    return (
        <nav className="top-4 w-full flex justify-between py-3 gap-3 px-3 z-10 md:px-10 lg:px-36">
            <div className="flex p-1 space-2  rounded-2xl items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={70} height={30} className="transition-transform duration-300 ease-in-out transform hover:scale-125 hover:cursor-pointer" onClick={goToHomepage} />
                <p className="text-2xl font-bold bg-yellow-300 rotate-2">Donask!</p>
                <p className="text-sm"> Give the best Q&A experience to your audience </p>
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
                console.log(data)
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


    if (authLoading) {
        return <Loading />
    }

    return (
        <div className="flex items-center flex-col min-h-screen bg-gradient-to-r from-white to-purple-200 gap-3 overflow-y-auto h-auto py-10">
            <NavBar 
                handleSignOut={handleSignOut} 
                userdata={userData} 
                isLoggingOut={isLoggingOut} 
                goToHomepage={goToHomepage}
                />
            <Toaster expand={true} position='top-center' richColors />
            <div className="grid grid-cols-4 gap-5 ">
                <div>
                    <JoinRoomForm />
                </div>
                <div className='w-[250px] h-[250px]'>
                    <Card className="w-full h-full flex flex-col justify-center items-center hover:bg-slate-100 hover:cursor-pointer">
                        <CardHeader className='text-2xl'>
                            <CardTitle>Lazy Fox 64</CardTitle>
                            <CardDescription>On going room</CardDescription>
                        </CardHeader>
                        <CardContent className='flex-1 flex flex-col justify-center'>
                            <p>Icon: number</p>
                            <p>Polls: 3</p>
                        </CardContent>
                    </Card>
                </div>

                <div className='w-[250px] h-[250px]'>
                    <Card
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full h-full flex flex-col justify-center items-center hover:bg-slate-100 hover:cursor-pointer">
                        <CardHeader className='text-2xl'>
                            <CardTitle>Create room </CardTitle>
                        </CardHeader>
                        <CardContent className='flex-1 flex flex-col justify-center items-center'>
                            <FaCirclePlus size={60} />
                        </CardContent>
                    </Card>
                    {
                        isDialogOpen && (
                            <Card
                                className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 backdrop-blur-md p-4"
                            >
                                <div className='w-[350px] h-[350]px'>
                                    <CreateRoomForm onClose={onCloseCreateRoom} />
                                </div>

                            </Card>

                        )
                    }
                </div>
                <div className='w-[250px] h-[250px]'>
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
            </div>
            <div className='flex justify-center items-center w-1/2'>
                <p className="w-auto text-lg font-bold mx-4">Past rooms</p>
            </div>
            <div className="grid grid-cols-4 gap-5 ">
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

            </div>
        </div>
    );
};

export default NewRoomPage;
