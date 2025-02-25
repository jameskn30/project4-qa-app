'use client'

import { getUserData as _getUserData, UserData } from '@/utils/supabase/auth';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const ExperimentPage = () => {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [channel, setChannel] = useState<any>(null)
    const supabase = createClient();

    useEffect(() => {
        // Set up Supabase channel
        const roomOne = supabase.channel('room-one', {
            config: {
                broadcast: { self: true },
            }
        })

        roomOne.on('broadcast', { event: 'test' }, (payload) => {
            console.log('Received broadcast:', payload)
        })

        roomOne.subscribe((status) => {
            if (status !== 'SUBSCRIBED') { return }
            roomOne.send({
                type: 'broadcast',
                event: 'test-my-messages',
                payload: { message: 'talking to myself' },
            })
        })

        setChannel(roomOne)

        // Get user data
        const getUserData = async () => {
            const user = await _getUserData()
            setUserData(user)
        }
        getUserData()

        // Cleanup function
        return () => {
            roomOne.unsubscribe()
        }
    }, [])

    const sendMessage = () => {
        console.log('sendMessage')
        if (channel) {
            channel.send({
                type: 'broadcast',
                event: 'test',
                payload: { message: 'Hello, world!' },
            })
        }
    }

    return (
        <div className="p-10">
            <h1>User Data</h1>
            {userData ? (
                <pre>{JSON.stringify(userData, null, 2)}</pre>
            ) : (
                <p>No user data available</p>
            )}

            <button onClick={sendMessage} className='bg-slate-300 p-2'>Test</button>

        </div>
    );
};

export default ExperimentPage;
