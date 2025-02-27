'use client'
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupForm from './SignupForm';

interface LoginDialogProps {
    isOpen: boolean
    onClose: () => void
    onLoginHandle: (formData: FormData) => void
}

const LoginDialog = ({ isOpen, onClose, onLoginHandle }: LoginDialogProps) => {

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] mx-auto my-8">
                <Tabs defaultValue="login" className="w-full h-[350px] flex flex-col items-center">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="w-full flex flex-col items-center">
                        <form className="space-y-4 w-full" onSubmit={(e) => { e.preventDefault(); onLoginHandle(new FormData(e.currentTarget)); }}>
                            <div className="w-full">
                                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
                                <Input value={"jameskn30@yopmail.com"} name="email" id="email" type="email" className="mt-1 block w-full rounded-md shadow-sm" />
                            </div>
                            <div className="w-full">
                                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</Label>
                                <Input value="test123" name="password" id="password" type="password" className="mt-1 block w-full rounded-md shadow-sm" />
                            </div>
                            <DialogFooter className="w-full">
                                <Button
                                    type="submit"
                                    className="w-full mt-4 bg-blue-500 text-white rounded-md shadow-md">Login</Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                    <TabsContent value="signup">
                        <SignupForm />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default LoginDialog;
