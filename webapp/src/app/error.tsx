'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const ErrorPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
                <p className="text-gray-600 mb-6">We could not find the page you were looking for.</p>
                <Button variant="outline" onClick={() => router.push('/')}>
                    Go Back to Home
                </Button>
            </div>
        </div>
    );
}

export default ErrorPage