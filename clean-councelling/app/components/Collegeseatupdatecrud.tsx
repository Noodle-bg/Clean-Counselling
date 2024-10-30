// app/components/Collegeseatupdatecrud.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Course {
    College_Name: string;
    Course_Name: string;
    Total_Seats: number;
    General_Seats: number;
    OBC_Seats: number;
    SC_ST_Seats: number;
    Seat_Freezing_price: string;
    General_Price: string;
    OBC_Price: string;
    SC_ST_Price: string;
}

const College_Crud = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginId = searchParams.get('loginId');
    const password = searchParams.get('password');
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!loginId || !password) {
                console.error('Login ID and Password are required.');
                return;
            }

            const response = await fetch('/api/colleges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginId, password })
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data.data);
            } else {
                const errorData = await response.json();
                console.error(errorData.message);
                router.push('/');
            }
        };

        fetchCourses();
    }, [loginId, password, router]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
            <div className="max-w-2xl text-center space-y-6">
                <h1 className="text-5xl font-bold text-teal-400">College Courses</h1>
                <p className="text-lg text-gray-300">Explore available courses and their seat distribution.</p>
            </div>
            <div className="mt-8 space-y-6 w-full max-w-2xl mx-auto flex flex-col items-center">
    {courses.map((course, index) => (
        <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-3xl font-semibold text-teal-300 mb-2 text-center">{course.Course_Name}</h2>
            <p className="text-lg text-gray-300 text-center">College: {course.College_Name}</p>
            <p className="text-lg text-gray-300 text-center">Total Seats: {course.Total_Seats}</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
                <button className="px-3 py-1 bg-teal-500 text-gray-900 font-semibold rounded-full">-</button>
                <span className="text-lg text-gray-300">{course.Total_Seats}</span>
                <button className="px-3 py-1 bg-teal-500 text-gray-900 font-semibold rounded-full">+</button>
            </div>
            <p className="text-lg text-gray-300 text-center mt-4">Seat Freezing Price: {course.Seat_Freezing_price}</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
                <button className="px-3 py-1 bg-teal-500 text-gray-900 font-semibold rounded-full">-</button>
                <span className="text-lg text-gray-300">{course.Seat_Freezing_price}</span>
                <button className="px-3 py-1 bg-teal-500 text-gray-900 font-semibold rounded-full">+</button>
            </div>
            <div className="mt-4 space-y-2 text-center">
                <p className="text-gray-300"><strong>General:</strong> {course.General_Seats} seats, Price: {course.General_Price}</p>
                <p className="text-gray-300"><strong>OBC:</strong> {course.OBC_Seats} seats, Price: {course.OBC_Price}</p>
                <p className="text-gray-300"><strong>SC/ST:</strong> {course.SC_ST_Seats} seats, Price: {course.SC_ST_Price}</p>
            </div>
        </div>
    ))}
</div>

        </div>
    );
};

export default College_Crud;
