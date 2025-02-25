'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function Error() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
        <p className="text-gray-600 mb-6">We couldn't find the room you were looking for.</p>
        <Button variant="primary" onClick={() => router.push('/')}>
          Go Back to Home
        </Button>
      </div>
    </div>
  );
}
