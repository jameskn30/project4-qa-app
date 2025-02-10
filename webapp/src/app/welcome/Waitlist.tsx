import React from 'react';
import {Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

const WaitlistForm = () => {
    return (
        <Card className="w-full max-w-[400px] mx-auto shadow-xl rounded-xl">
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
                    <Button type="submit" className="w-full mt-4 bg-blue-500 text-white rounded-md shadow-md">Join Waitlist</Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default WaitlistForm;
