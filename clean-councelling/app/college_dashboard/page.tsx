'use client';
import React from 'react';
import { useUser } from '../context/UserContext';

// Define a type for the course data
interface Course {
    College_Name: string;
    Course_Name: string;
    Seat_Freezing_price: string;
    Total_Seats: number;
}

const College_Dashboard: React.FC = () => {
    const { user } = useUser(); // Assume user is an array of Course

    // Check if user is loaded
    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
            <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-lg transition-transform transform">
                <h1 className="text-4xl font-bold text-teal-400 mb-6 text-center">Courses Offered</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {user.map((course: Course, index: number) => (
                        <div key={index} className="space-y-4">
                            <p className="text-xl font-semibold">Course Name:</p>
                            <p className="text-2xl text-teal-300">{course.Course_Name}</p>
                            <p className="text-xl font-semibold">Total Seats:</p>
                            <p className="text-2xl text-teal-300">{course.Total_Seats}</p>
                            <p className="text-xl font-semibold">Seat Freezing Price:</p>
                            <p className="text-2xl text-teal-300">{course.Seat_Freezing_price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default College_Dashboard;
