import { revalidatePath } from "next/cache";

export default async function EditFormPage() {

    async function handleSubmit(formData: FormData) {
        'use server'
        console.log('Form data submitted on server:', formData);
        console.log('watigin for 3 seconds')
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Mock sleep for 3 seconds
        revalidatePath('/experiment/editForm');
    }

    return (
        <div className="p-10 border border-slate-300">
            <h1>Edit Form</h1>
            <form action={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">
                    Submit
                </button>
            </form>
        </div>
    );
};
