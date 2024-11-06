// app/results/page.tsx
'use client';
import Result from '@/components/STUDENT_END/Result';
import { useSearchParams } from 'next/navigation';

const ResultsPage = () => {
    const searchParams = useSearchParams();
    const loginId = searchParams.get('loginId');
    const password = searchParams.get('password');

    if (!loginId || !password) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
                <div className="text-2xl text-red-500">Missing credentials</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Result />
        </div>
    );
};

export default ResultsPage;