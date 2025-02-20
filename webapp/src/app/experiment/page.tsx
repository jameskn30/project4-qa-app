import { getUserData } from '@/utils/supabase/userData';
import EditFormPage from './editform/page';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';


const ExperimentPage: React.FC = async () => {
    // const userData = await getUserData(); // Call getUserData from the server
    let userData = await getUserData()

    async function TestButton() {
        'use server'
        console.log('TestButton waiting for 3 seconds')
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Mock sleep for 3 seconds
        redirect('/')
    }


    return (
        <div className="p-10">
            <h1>User Data</h1>
            {userData ? (
                <pre>{JSON.stringify(userData, null, 2)}</pre>
            ) : (
                <p>No user data available</p>
            )}

            <form action={TestButton}>

                <button className="bg-slate-300" type="submit">Test</button>

            </form>
        </div>
    );
};


export default ExperimentPage;
