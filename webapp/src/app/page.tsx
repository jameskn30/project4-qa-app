'use client'
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { FaLinkedin, FaGithub, FaXTwitter, FaInstagram } from "react-icons/fa6";
import LoginDialog from '@/app/components/LoginDialog';
import { createClient } from '@/utils/supabase/component'
import { Spinner } from '@/components/ui/spinner';
import { login, signout } from '@/app/utils/auth';
import { useRouter } from 'next/navigation';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LandingPageNavbar = ({ isLoggedIn, isLoadingAuth, onSignOut, openDialog }: { isLoggedIn: boolean, isLoadingAuth: boolean, onSignOut: () => void, openDialog: () => void }) => {
    const scrollToWaitlist = () => {
        const element = document.getElementById('waitlist');
        const yOffset = -100; // Margin of 10px
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    return (
        <nav className="sticky top-4 w-full flex justify-between py-3 gap-3 px-3 z-10 md:px-10 lg:px-36">
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
                <button className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">⚡ Bolt.qa</button>
            </div>
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
                <a href="https://jameskn30.github.io/portfolio/" className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl" target="_blank">About me</a>
                <button onClick={scrollToWaitlist} className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Wait list</button>
            </div>

            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
                {
                    isLoadingAuth ? (
                        <Spinner />
                    ) : (
                        isLoggedIn ? (
                            <>
                                <a href="/dashboard" className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Dashboard</a>
                                <button onClick={onSignOut} className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Log out</button>
                            </>
                        ) : (
                            <button onClick={scrollToWaitlist} className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Login/Signup</button>
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
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("signup");
    const supabase = createClient()
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setAuthLoading(false);
        };

        checkUser();

        console.log('isLoggedIn ' + isLoggedIn)

    }, [supabase]);

    const handleLogin = async (formData: FormData) => {
        const success = await login(formData);
        if (success) {
            setIsLoggedIn(true);
            router.push('/dashboard')
        }
    };

    const handleSignOut = async () => {
        const success = await signout();
        if (success) {
            toast.success("Logged out successfully")
            setIsLoggedIn(false);
        } else {
            toast.error("An error happened while signing out")
        }
    };

    const openDialog = () => {
        console.log("open dialog")
        setLoginOpen(true);
    };

    const handleCloseLogin = () => {
        setLoginOpen(false);
    };

    return (
        <div className="relative flex flex-col bg-gradient-to-r from-white to-purple-200 items-center min-h-screen h-full">
            <LandingPageNavbar openDialog={openDialog} isLoggedIn={isLoggedIn} isLoadingAuth={authLoading} onSignOut={handleSignOut} />
            <Toaster expand={true} position='top-center' richColors />

            <div className="flex flex-col lg:flex-row min-h-full w-auto px-4 lg:px-20 py-10">
                <div className="flex flex-1 mb-10 lg:mb-0" id="intro-container">
                    <div className="flex flex-col gap-10 font-mono text-center lg:text-left">
                        <p className="text-6xl lg:text-8xl font-bold text-center w-full">Bolt.qa</p>

                        <p className="text-3xl lg:text-4xl font-bold max-w-[600px] mx-auto lg:mx-0">
                            <span className="inline-block -rotate-3 bg-yellow-300">Group </span> your audience questions so you can answer the <span className="inline-block -rotate-2 bg-green-300">most relevant </span> <span className="bg-yellow-300 inline-block transform rotate-3"> quickly</span>
                        </p>

                        <p className="text-2xl lg:text-3xl max-w-[500px] mx-auto lg:mx-0">
                            <span className="inline-block -rotate-3 bg-yellow-300">Don't</span> waste time passing the microphone 🎤. Let your audience <span className="inline-block rotate-2 bg-green-300">ask and vote 👍</span> which question they want answered 👏 in <span className="underline">real time</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center" id="waitlist-container mt-10">
                    <section id="waitlist" className="w-full flex">
                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full h-[500px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>
                            <TabsContent value="login">
                                <LoginForm/>
                            </TabsContent>
                            <TabsContent value="signup">
                                <SignupForm />
                            </TabsContent>
                        </Tabs>
                    </section>
                </div>
            </div>

            {/* Quick demo sections */}
            <div className='w-full h-96 bg-slate-300'>

            </div>


            {/* Pricing section */}
            <div className='w-full h-96 bg-blue-300'>

            </div>

            {/* Customer testimony section */}

            {/* Brief about me section */}
            <div className='w-full h-96 bg-yellow-300'>

            </div>
            {
                authLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                ) : (
                    !isLoggedIn && <LoginDialog isOpen={isLoginOpen} onClose={handleCloseLogin} onLoginHandle={handleLogin} />
                )
            }
            <Footer />
        </div>
    );
};

export default WelcomePage;

