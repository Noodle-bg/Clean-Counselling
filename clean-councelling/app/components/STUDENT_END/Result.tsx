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
            const response = await fetch(`/api/STUDENT_END/results/${loginId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                setAllocation(data.data[0]);
            } else {
                setError('No allocation found');
            }
        } catch (err) {
            setError('Error fetching results');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFreeze = () => {
        if (allocation) {
            // router.push(`/payment-portal?loginId=${loginId}&collegeName=${allocation.College_Name}&courseName=${allocation.Course_Name}`);
            alert('Freeze functionality coming soon!');


        }
    };

    const handleSlide = () => {
        // Implement slide functionality
        alert('Slide functionality coming soon!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center">
                <div className="text-2xl text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => router.push('/')}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
            <div className="max-w-2xl text-center space-y-8">
                <h1 className="text-5xl font-bold text-teal-400">
                    Congratulations! You have been allocated to:
                </h1>
                
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-semibold text-teal-300 mb-4">
                        {allocation?.Course_Name}
                    </h2>
                    <p className="text-xl text-gray-300 mb-6">
                        at {allocation?.College_Name}
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
        </div>
    );
};

export default Result;