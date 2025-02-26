'use client'
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { FaLinkedin, FaGithub, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { Spinner } from '@/components/ui/spinner';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import JoinRoomForm from './components/JoinRoomForm';
import { getUserData as _getUserData, signout } from '@/utils/supabase/auth'
import Image from 'next/image';

const LandingPageNavbar = ({ isLoggedIn, isLoadingAuth, onSignOut }: { isLoggedIn: boolean, isLoadingAuth: boolean, onSignOut: () => void }) => {
    const scrollToWaitlist = () => {
        const element = document.getElementById('waitlist');
        const yOffset = -100; // Margin of 10px
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    return (
        <nav className="sticky top-4 w-full flex justify-between py-3 gap-3 px-3 z-10 md:px-10 lg:px-36">

            <div className="flex p-1 space-2  gap-3 justify-end w-full ">
                <Button variant="secondary">
                    <Link href="https://jameskn30.github.io/portfolio/" target="_blank">About Me</Link>
                </Button>
                {
                    isLoadingAuth ? (
                        <Spinner />
                    ) : (
                        isLoggedIn === false ? (
                            <Button variant={'destructive'} onClick={scrollToWaitlist}>Login/Signup</Button>
                        ) : (
                            <>
                                <Button variant={'ghost'} asChild className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl bg-white border-none">
                                    <Link href="/dashboard">Dashboard</Link>

                                </Button>
                                <Button variant={"destructive"} onClick={onSignOut} className="px-2 py-1 rounded-xl ">Logout</Button>
                            </>
                        )
                    )
                }
            </div>
        </nav>
    )
}

const Footer = () => {
    return (
        <footer className="w-full bg-gray-700 text-white py-1 flex justify-center mt-10 fixed bottom-0">
            <div className="flex flex-col md:flex-row items-center justify-center container px-4">
                <div className="md:mb-0 flex items-center gap-7 flex-col lg:flex-row py-3">
                    <h2 className="text-xl font-bold">Connect:</h2>
                    <ul className="flex justify-center items-center space-x-4">
                        <div className="flex items-center space-x-4 ">

                            <li><a href="#" className="hover:underline" ><FaLinkedin /></a></li>
                            <li><a href="#" className="hover:underline" ><FaXTwitter /></a></li>
                            <li><a href="#" className="hover:underline" ><FaGithub /></a></li>
                            <li><a href="#" className="hover:underline" ><FaInstagram /></a></li>
                        </div>
                        <li><a href="#" className="hover:underline" ><span className="font-bold">email: </span>jameskn30@gmail.com</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

const WelcomePage = () => {
    const [activeTab, setActiveTab] = useState("signup");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const getUserData = async () => {
            // const { data: { session } } = await supabase.auth.getSession();
            const user = await _getUserData()
            console.log(user)
            setIsLoggedIn(!!user);
            setAuthLoading(false);
        };

        // checkUser();
        getUserData()
    }, []);

    const handleSignOut = async () => {
        const { success, error } = await signout();
        if (success) {
            setIsLoggedIn(false);
        }
        else if (error) {
            toast.error(error.message)
        }
    };

    return (
        <div className="relative flex flex-col bg-gradient-to-r from-white to-blue-200 items-center min-h-screen h-full">
            <LandingPageNavbar isLoggedIn={isLoggedIn} isLoadingAuth={authLoading} onSignOut={handleSignOut} />
            <Toaster expand={true} position='top-center' richColors />

            <div className={`flex flex-col lg:flex-row h-auto w-auto px-4 lg:px-20 py-10 ${isLoggedIn ? 'justify-center' : ''}`}>
                <div id="intro-container" className="flex flex-1 mb-10 lg:mb-0">
                    <div className="flex flex-col font-mono text-center lg:text-left gap-5">
                        {/* <p className="text-6xl lg:text-8xl font-bold text-center w-full">Bolt.qa</p> */}
                        <div className="flex space-2 items-center">
                            <Image src="/logo.png" alt="Logo" width={150} height={30} className="transition-transform duration-300 ease-in-out transform hover:scale-125 hover:cursor-pointer" />
                            <p className='text-6xl font-bold'>Donask</p>
                        </div>

                        <p className="text-3xl lg:text-4xl font-bold max-w-[600px] mx-auto lg:mx-0">
                            <span className="inline-block -rotate-3 bg-yellow-300">Group </span> your audience questions so you can answer the <span className="inline-block -rotate-2 bg-green-300">most relevant </span> <span className="bg-yellow-300 inline-block transform rotate-3"> quickly</span>
                        </p>

                        <p className="text-2xl lg:text-3xl max-w-[500px] mx-auto lg:mx-0">
                            <span className="inline-block -rotate-3 bg-yellow-300">Don't</span> waste time passing the microphone 🎤. Let your audience <span className="inline-block rotate-2 bg-green-300">ask and vote 👍</span> which question they want answered 👏 in <span className="underline">real time</span>
                        </p>
                    </div>
                </div>

                <div className="flex w-full lg:w-1/3 justify-center items-center">
                    <div className=" w-[300px] h-[300px]">
                        <JoinRoomForm />
                    </div>
                </div>


            </div>

            {/* Quick demo sections */}
            <div className='w-full py-5  6bg-slate-300'>
                {!isLoggedIn && (
                    <div className="flex items-center" id="waitlist-container mt-10">
                        <section id="waitlist" className="w-full flex justify-center">
                            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-[350px] h-[500px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="login">Login</TabsTrigger>
                                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                                </TabsList>
                                <TabsContent value="login">
                                    <LoginForm />
                                    {isLoggingIn && <Spinner />}
                                </TabsContent>
                                <TabsContent value="signup">
                                    <SignupForm />
                                </TabsContent>
                            </Tabs>
                        </section>
                    </div>
                )}
            </div>

            {/* Pricing section */}
            <div className='w-full h-96 bg-blue-300 flex flex-col justify-center items-center'>
                <h2 className="text-4xl font-bold mb-4">Pricing</h2>
                <p className="text-lg text-center max-w-2xl">Choose the plan that fits your needs. We offer flexible pricing options for individuals and organizations.</p>
                <Button className="mt-4">View Pricing</Button>
            </div>

            {/* Customer testimony section */}
            <div className='w-full h-96 bg-green-300 flex flex-col justify-center items-center'>
                <h2 className="text-4xl font-bold mb-4">Customer Testimonials</h2>
                <p className="text-lg text-center max-w-2xl">Hear from our satisfied customers about how Bolt.qa has transformed their events and meetings.</p>
                <Button className="mt-4">Read Testimonials</Button>
            </div>

            {/* Brief about me section */}
            <div className='w-full h-96 bg-yellow-300 flex flex-col justify-center items-center'>
                <h2 className="text-4xl font-bold mb-4">About Me</h2>
                <p className="text-lg text-center max-w-2xl">Learn more about the creator of Bolt.qa and the journey behind building this platform.</p>
                <Button className="mt-4">About Me</Button>
            </div>

            {
                authLoading && (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                )
            }
            <Footer />
        </div>
    );
};

export default WelcomePage;

