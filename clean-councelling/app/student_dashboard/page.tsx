'use client'
// app/student_dashboard/page.tsx

import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import PreferencesForm from '../components/STUDENT_END/PreferencesForm';

export default function StudentDashboard() {
    const { user } = useUser();
    const router = useRouter();
    const [showPreferencesForm, setShowPreferencesForm] = useState(false);

    if (!user) {
        return <p>Loading...</p>;
    }
    console.log(user)

    const handleEditPreferences = () => {
        setShowPreferencesForm(!showPreferencesForm);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-8">
            <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-lg">
                <h1 className="text-4xl font-bold text-teal-400 mb-6 text-center">Welcome, {user?.Student_name}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-xl font-semibold">Rank:</p>
                        <p className="text-2xl text-teal-300">{user?.student_rank}</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-xl font-semibold">Parent's Name:</p>
                        <p className="text-2xl text-teal-300">{user?.Parent_name}</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-xl font-semibold">Email:</p>
                        <p className="text-2xl text-teal-300">{user?.email}</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-xl font-semibold">Phone Number:</p>
                        <p className="text-2xl text-teal-300">{user?.Phone_Number}</p>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition"
                        onClick={handleEditPreferences}
                    >
                        {showPreferencesForm ? "Close Preferences Form" : "Edit Preferences"}
                    </button>
                </div>
            </div>

            {showPreferencesForm && (
                <PreferencesForm
                    studentId={user?.Student_id}
                    onCancel={() => setShowPreferencesForm(false)}
                />
            )}
        </div>
    );
}
