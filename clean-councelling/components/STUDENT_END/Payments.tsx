// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// interface PaymentDetails {
//     basePrice: number;
//     category: string;
//     finalPrice: number;
// }

// const Payments = () => {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const loginId = searchParams.get('loginId');
//     const password = searchParams.get('password');

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

//     useEffect(() => {
//         fetchPaymentDetails();
//     }, [loginId, password]); 

//     const fetchPaymentDetails = async () => {
//         if (!loginId || !password) {
//             setError('Missing login credentials');
//             setLoading(false);
//             return;
//         }

//         try {
//             const response = await fetch('/api/STUDENT_END/payments', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ loginId, password })
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch payment details');
//             }

//             const data = await response.json();
//             setPaymentDetails(data.data);
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Failed to load payment details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
//                 <div className="text-2xl">Loading payment details...</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center">
//                 <div className="text-2xl text-red-500 mb-4">{error}</div>
//                 <button
//                     onClick={() => router.push('/')}
//                     className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
//                 >
//                     Return to Login
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
//             <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
//                 <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center">
//                     Payment Details
//                 </h1>

//                 <div className="space-y-4 mb-8">
//                     <p className="text-gray-300">
//                         Base Price: ₹{paymentDetails?.basePrice}
//                     </p>
//                     <p className="text-gray-300">
//                         Category: {paymentDetails?.category}
//                     </p>
//                     <p className="text-xl font-bold text-teal-300">
//                         Final Price: ₹{paymentDetails?.finalPrice}
//                     </p>
//                 </div>

//                 <button
//                     onClick={() => router.push(`/payment-portal?loginId=${loginId}&password=${password}`)}
//                     className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
//                 >
//                     Proceed to Payment
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Payments;