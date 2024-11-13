//app/payments/page.tsx
'use client'
import Payments from '@/components/STUDENT_END/Payments'; 
import { useSearchParams } from 'next/navigation';
const PaymentsPage = () => {
    const searchParams = useSearchParams();
    const loginId = searchParams.get('loginId');

    if (!loginId) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
                <div className="text-2xl text-red-500">Missing credentials</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Payments/>
        </div>
    );
};

export default PaymentsPage;

