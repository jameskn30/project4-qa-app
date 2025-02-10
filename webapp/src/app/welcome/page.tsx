'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FaLinkedin, FaGithub, FaXTwitter, FaInstagram } from "react-icons/fa6";

const LandingPageNavbar = () => {
    const scrollToWaitlist = () => {
        document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav className="sticky top-4 w-full flex justify-center py-3 gap-3 z-10">
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
                <button className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">⚡ Bolt.qa</button>
            </div>
            <div className="flex p-1 space-2 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
                <a href="https://jameskn30.github.io/portfolio/" className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl" target="_blank">About me</a>
                <button onClick={scrollToWaitlist} className="px-2 py-1 hover:bg-slate-300 text-slate-800 rounded-xl">Wait list</button>
            </div>
        </nav>
    )
}

const WaitlistForm = () => {
    const handleJoinWaitlist = (e) => {
        toast.success("Joined wait list 👏")
    }

    return (
        <Card className="w-full max-w-[400px] mx-auto shadow-xl rounded-xl mb-32 lg:mb-0">
            <CardHeader>
                <CardTitle className="text-center">Join our wait list with 34 others</CardTitle>
                <p className="text-slate-500 text-sm">free 10 PRO sessions where you can host 250 people</p>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <Input id="name" type="text" className="mt-1 block w-full rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <Input id="email" type="email" className="mt-1 block w-full rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="profession" className="block text-sm font-medium text-gray-700">Your profession</label>
                        <Input id="profession" type="text" className="mt-1 block w-full rounded-md shadow-sm" />
                    </div>
                    <Button onClick={(e) => handleJoinWaitlist(e)} type='button' className="w-full mt-4 bg-blue-500 hover:bg-blue-800  text-white rounded-md shadow-md">Join Waitlist</Button>
                </form>
            </CardContent>
        </Card>

    );
};

const Footer = () => {
    return (
        <footer className="w-full bg-gray-700 text-white py-1 flex justify-center mt-10 fixed bottom-0">
            <div className="flex flex-col md:flex-row items-center justify-center container px-4">
                <div className="md:mb-0 flex items-center gap-7 flex-col lg:flex-row py-3">
                    <h2 className="text-xl font-bold">Let's connect:</h2>
                    <ul className="flex justify-center items-center space-x-4">
                        <div className="flex items-center space-x-4 ">

                        <li><a href="#" className="hover:underline" ><FaLinkedin/></a></li>
                        <li><a href="#" className="hover:underline" ><FaXTwitter/></a></li>
                        <li><a href="#" className="hover:underline" ><FaGithub/></a></li>
                        <li><a href="#" className="hover:underline" ><FaInstagram/></a></li>
                        </div>
                        <li><a href="#" className="hover:underline" ><span className="font-bold">Email: </span>jameskn30@gmail.com</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

const WelcomePage = () => {

    return (
        <div className="relative flex flex-col bg-gradient-to-r from-white to-purple-200 items-center min-h-screen h-full">
            <LandingPageNavbar />
            <Toaster expand={true} position='top-center' richColors />

            <div className="flex flex-col lg:flex-row min-h-full w-auto px-4 lg:px-20 py-10">
                <div className="flex flex-1 mb-10 lg:mb-0" id="intro-container">
                    <div className="flex flex-col gap-10 font-mono">
                        <p className="text-8xl font-bold text-center w-full">Bolt.qa</p>

                        <p className="text-4xl font-bold max-w-[600px]">
                            <span className="inline-block -rotate-3 bg-yellow-300">Group </span> your audience questions so you can answer the <span className="inline-block -rotate-2 bg-green-300">most relevant </span> <span className="bg-yellow-300 inline-block transform rotate-3"> quickly</span>
                        </p>

                        <p className="text-3xl max-w-[500px]">
                            <span className="inline-block -rotate-3 bg-yellow-300">Don't</span> waste time passing the microphone 🎤. Let your audience <span className="inline-block rotate-2 bg-green-300">ask and vote 👍</span> which question they want answered 👏 in <span className="underline">real time</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center" id="waitlist-container">
                    <section id="waitlist" className="w-full flex">
                        <WaitlistForm />
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default WelcomePage;

