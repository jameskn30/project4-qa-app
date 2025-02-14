import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const SignupForm = ({handleSignUp} : {handleSignUp: (formData: FormData) => void}) => {
    const [email, setEmail] = useState("jameskn_test@yopmail.com");
    const [password, setPassword] = useState("test123");
    const [fullName, setFullName] = useState("James Nguyen");

    const handleGoogleSignIn = () => {
        toast.success("Test sign in with Google 👏")
    }

    return (
        <Card className="w-full mx-auto shadow-xl rounded-xl mb-32 lg:mb-0">
            <CardHeader>
                <CardTitle className="text-center">Sign up to join waitlist with 34 others</CardTitle>
                <p className="text-slate-500 text-sm">free 10 PRO sessions, 250 people per session</p>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full name</label>
                        <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} name="fullname" id="fullname" type="text" className="mt-1 block w-full rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} name="email" id="email" type="email" className="mt-1 block w-full rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <Input value={password} onChange={(e) => setPassword(e.target.value)} name="password" id="password" type="password" className="mt-1 block w-full rounded-md shadow-sm" />
                    </div>
                    <Button formAction={handleSignUp} type='submit' className="w-full mt-4 bg-blue-500 hover:bg-blue-800 text-white rounded-md shadow-md">Sign up</Button>
                </form>
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-4 text-gray-500">or</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>
                <Button onClick={handleGoogleSignIn} type='button' className="w-full mt-4 bg-white hover:bg-slate-300 text-black rounded-md flex items-center justify-center border border-slate-200">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.9 0 7.1 1.3 9.6 3.5l7.1-7.1C36.6 2.3 30.7 0 24 0 14.6 0 6.4 5.4 2.4 13.3l8.3 6.5C13.1 13.2 18.1 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.2-2.4 5.9-5 7.7l8.3 6.5c4.8-4.4 7.6-10.9 7.6-18.7z"></path>
                        <path fill="#FBBC05" d="M10.7 28.2c-1.1-3.2-1.1-6.6 0-9.8L2.4 13.3C-1.1 19.1-1.1 28.9 2.4 34.7l8.3-6.5z"></path>
                        <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16.1-5.7l-8.3-6.5c-2.3 1.5-5.2 2.4-7.8 2.4-5.9 0-10.9-3.7-12.7-8.8l-8.3 6.5C6.4 42.6 14.6 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    Sign in with Google
                </Button>
            </CardContent>
        </Card>
    );
};

export default SignupForm