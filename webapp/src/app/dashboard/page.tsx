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

const NavBar = ({ userdata, handleSignOut, isLoggingOut }: { userdata: UserData | null, handleSignOut: () => void, isLoggingOut: boolean }) => {

    return (
        <nav className="top-4 w-full flex justify-between py-3 gap-3 px-3 z-10 md:px-10 lg:px-36">
            <div className="flex p-1 space-2  rounded-2xl items-center">
                <Image src="/logo.png" alt="Logo" width={70} height={30} className="mx-2" />
                <p className="text-2xl font-bold">Donask</p>
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

        console.log('isLoggedIn ' + isLoggedIn)

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

    if (authLoading) {
        return <Loading />
    }

    return (
        <div className="flex items-center flex-col min-h-screen bg-gradient-to-r from-white to-purple-200 gap-3 overflow-y-auto h-auto py-10">
            <NavBar handleSignOut={handleSignOut} userdata={userData} isLoggingOut={isLoggingOut} />
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

            {/* <Tabs defaultValue="account" className="w-[350px] flex justify-center flex-col items-center">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="account">Join Room</TabsTrigger>
                        <TabsTrigger value="password" onClick={() => {
                            if (roomId === null && !activeRoom) {
                                handleFetchRandomId();
                            }

                        }}>
                            {
                                activeRoom ? `1 Ongoing Room` : `Create Room`
                            }
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <JoinRoomForm />
                    </TabsContent>
                    <TabsContent value="password" id="password-tab">
                        <Card className="bg-white p-2 gap-4 flex flex-col justify-center shadow-lg text-center w-[350px] h-auto py-5">
                            {fetchingRandomRoomId && <Spinner />}
                            {!fetchingRandomRoomId && (
                                <>
                                    <div className="flex gap-3 justify-center">
                                        <p className="text-4xl flex-1 text-center">{roomId}</p>
                                        {
                                            !activeRoom && (
                                                <Button
                                                    variant={'ghost'}
                                                    className="rounded-lg border-2 border-transparent hover:border-slate-300 px-2 bg-white border-none"
                                                    onClick={handleFetchRandomId}>
                                                    <FaRandom />
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
                                    {
                                        activeRoom ? (
                                            <div className='flex gap-2 flex-col'>
                                                <Button className="bg-blue-500 text-white hover:bg-blue-700 mx-10"
                                                    onClick={() => router.push(`/room/${roomId}`)}>
                                                    Join room
                                                </Button>
                                                <Button variant={"destructive"}
                                                    className="mx-10"
                                                    onClick={() => console.log('remove room')}>
                                                    Remove room
                                                </Button>
                                            </div>

                                        ) : (
                                            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 mx-10"
                                                onClick={handleStartRoom}>
                                                Start room
                                            </Button>
                                        )
                                    }
                                </>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs> */}
        </div>
    );
};

export default NewRoomPage;
