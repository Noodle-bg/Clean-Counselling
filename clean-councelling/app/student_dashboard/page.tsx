'use client'
// app/student_dashboard/page.tsx
import { useUser } from '../context/UserContext'; // Import the useUser hook
import Image from 'next/image';

// export const metadata = {
//     title: 'Student Dashboard',
//     description: 'Overview of your details and performance',
// };

export default function StudentDashboard() {
    const { user } = useUser();  // Get the user data from the context

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
            <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-lg transition-transform transform">
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
                {/* <div className="flex justify-center mt-8">
                    <Image src="/assets/achievement.svg" width={200} height={200} alt="Achievement" />
                </div> */}
            </div>
        </div>
    );
}
