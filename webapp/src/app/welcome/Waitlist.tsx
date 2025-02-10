import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const WaitlistForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profession: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value
        }));
    };

    const handleJoinWaitlist = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                toast.success("Joined wait list 👏");
            } else {
                toast.error("Failed to join wait list");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <Card className="w-full max-w-[400px] mx-auto shadow-xl rounded-xl">
            <CardHeader>
                <CardTitle className="text-center">Join our wait list with 34 others</CardTitle>
                <p className="text-slate-500 text-sm">free 10 PRO sessions where you can host 250 people</p>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleJoinWaitlist}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <Input id="name" type="text" className="mt-1 block w-full rounded-md shadow-sm" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <Input id="email" type="email" className="mt-1 block w-full rounded-md shadow-sm" value={formData.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="profession" className="block text-sm font-medium text-gray-700">Your profession</label>
                        <Input id="profession" type="text" className="mt-1 block w-full rounded-md shadow-sm" value={formData.profession} onChange={handleChange} />
                    </div>
                    <Button type="submit" className="w-full mt-4 bg-blue-500 hover:bg-blue-800 text-white rounded-md shadow-md">Join Waitlist</Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default WaitlistForm;
