import { getUserData } from '@/utils/supabase/userData';
import EditFormPage from './EditForm/page';

const ExperimentPage: React.FC = async () => {
    // const userData = await getUserData(); // Call getUserData from the server
    let userData = await getUserData()

    // async function reload() {
    //     'user server'
    //     await revalidatePath('/experiment');
    //     const userData = await getUserData();
    //     console.log(userData);
    // }

    // reload()

    return (
        <div className="p-10">
            <h1>User Data</h1>
            {userData ? (
                <pre>{JSON.stringify(userData, null, 2)}</pre>
            ) : (
                <p>No user data available</p>
            )}
            <EditFormPage/>
        </div>
    );
};


export default ExperimentPage;
