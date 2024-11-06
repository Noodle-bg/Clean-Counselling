'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AllocationResult {
    Student_Name: string;
    Course_Name: string;
    College_Name: string;
}

const Result = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginId = searchParams.get('loginId');
    const [allocation, setAllocation] = useState<AllocationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchResults();
    }, [loginId]);

    const fetchResults = async () => {
        if (!loginId) {
            setError('Login credentials are required');
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching results for loginId:', loginId); // Debug log
            const response = await fetch(`/api/STUDENT_END/results/${loginId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch results');
            }

            if (data.success && data.data && Array.isArray(data.data)) {
                if (data.data.length > 0) {
                    setAllocation(data.data[0]);
                } else {
                    setError('No allocation found for your ID');
                }
            } else {
                setError(data.message || 'No allocation data available');
            }
        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'Error fetching results');
        } finally {
            setLoading(false);
        }
    };

    const handleFreeze = () => {
        console.log('Freezing seat:', allocation);
        router.push(`/payments?loginId=${loginId}`); 

    };

    const handleSlide = () => {
        console.log('Sliding to next round:', allocation);

    };



    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
            {loading ? (
                <div className="text-2xl">Loading...</div>
            ) : error ? (
                <div className="flex flex-col items-center">
                    <div className="text-2xl text-red-500 mb-4">{error}</div>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Return to Login
                    </button>
                </div>
            ) : allocation ? (
                <div className="max-w-2xl text-center space-y-8">
                    <h1 className="text-5xl font-bold text-teal-400">
                        Congratulations! You have been allocated to:
                    </h1>
                    
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-semibold text-teal-300 mb-4">
                            {allocation.Course_Name}
                        </h2>
                        <p className="text-xl text-gray-300 mb-6">
                            at {allocation.College_Name}
                        </p>
                        
                        <p className="text-lg text-gray-300 mb-8">
                            Would you like to Freeze your seat or Slide to the next round?
                        </p>
                        
                        <div className="flex justify-center gap-6">
                            <button 
                                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                onClick={handleFreeze}
                            >
                                Freeze Seat
                            </button>
                            <button 
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                onClick={handleSlide}
                            >
                                Slide to Next Round
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-2xl text-red-500">No allocation data available</div>
            )}
        </div>
    );
};

export default Result;