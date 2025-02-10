// 'use client'
import React from 'react';
import * as motion from "motion/react-client"
// import { FaPaperPlane, FaThumbsDown, FaThumbsUp } from 'react-icons/fa6';
import WaitlistForm from './Waitlist'

const LandingPageNavbar = () => {
    return (
        <nav className="sticky top-4 w-full flex justify-between px-20 py-3">
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl">
                <button className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">LOGO</button>
            </div>
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl">
                <button className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Pricing</button>
                <button className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Solution </button>
            </div>
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl">
                <button className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Login</button>
                <button className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Sign up</button>
            </div>
        </nav>
    )
}


const WelcomePage = () => {

    return (
        <div className="flex flex-col  h-screen bg-gradient-to-r from-white to-purple-200 items-center">
            <LandingPageNavbar />

            <div className="flex h-full flex-col md:flex-row">
                {/* sliding div */}
                <div className="flex flex-1 m-10" id="intro-container">
                    <div className="flex flex-col gap-10 font-mono">
                        <p className="text-8xl font-bold text-center w-full">Clarify.ai</p>

                        <p className="text-4xl font-bold  max-w-[600px]">
                            <span className="inline-block -rotate-3 bg-yellow-300">Group </span> your audience questions so you can answer the <span className="inline-block -rotate-2 bg-green-300">most relevant </span>  <span className="bg-yellow-300 inline-block transform rotate-3"> quickly</span> </p>

                        <p className="text-3xl  max-w-[500px]">
                            <span className="inline-block -rotate-3 bg-yellow-300">Don't</span> waste time passing the microphone 🎤. Let your audience  <span className="inline-block rotate-2 bg-green-300">ask and vote 👍</span> which question they want answer 👏 in <span className="underline">real time</span></p>
                    </div>

                    {/* <motion.div
                        className="absolute top-1/3 left-0 bg-red-500 w-20 h-20 rounded-full"
                        initial={{ x: -100 }}
                        animate={{ x: "18vw" }}
                        transition={{ type: "spring", stiffness: 50 }}
                    /> */}
                </div>

                <div className="flex items-center mx-20" id="waitlist-container">
                    <WaitlistForm />
                </div>

            </div>

        </div>
    );
};

export default WelcomePage;

