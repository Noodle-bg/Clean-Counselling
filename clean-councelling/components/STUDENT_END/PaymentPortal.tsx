// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { v4 as uuidv4 } from 'uuid';

// interface PaymentDetails {
//     basePrice: number;
//     category: string;
//     finalPrice: number;
//     studentId: string;
// }

// const PaymentPortal = () => {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const loginId = searchParams.get('loginId');
//     const password = searchParams.get('password');

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
//     const [processing, setProcessing] = useState(false);

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

//     const processPayment = async () => {
//         if (!paymentDetails) return;
        
//         setProcessing(true);
//         const paymentId = uuidv4();
//         const currentDateTime = new Date().toISOString();

//         try {
//             const response = await fetch('/api/STUDENT_END/payments/portal', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     paymentId,
//                     studentId: paymentDetails.studentId,
//                     amount: paymentDetails.finalPrice,
//                     paymentDate: currentDateTime,
//                     status: 'completed'
//                 })
//             });

//             if (!response.ok) {
//                 throw new Error('Payment processing failed');
//             }

//             // Show success message and redirect to confirmation page
//             alert('Payment successful!');
//             router.push('/dashboard');

//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Payment processing failed');
//         } finally {
//             setProcessing(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
//                 <div className="text-2xl">Processing payment details...</div>
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
//                     Payment Portal
//                 </h1>

//                 <div className="space-y-4 mb-8">
//                     <div className="bg-gray-700 p-4 rounded-lg">
//                         <p className="text-sm text-gray-400">Transaction ID</p>
//                         <p className="text-lg font-mono">{uuidv4()}</p>
//                     </div>

//                     <div className="bg-gray-700 p-4 rounded-lg">
//                         <p className="text-sm text-gray-400">Date & Time</p>
//                         <p className="text-lg">{new Date().toLocaleString()}</p>
//                     </div>

//                     <div className="bg-gray-700 p-4 rounded-lg">
//                         <p className="text-sm text-gray-400">Student ID</p>
//                         <p className="text-lg">{paymentDetails?.studentId}</p>
//                     </div>

//                     <div className="bg-gray-700 p-4 rounded-lg">
//                         <p className="text-sm text-gray-400">Category</p>
//                         <p className="text-lg">{paymentDetails?.category}</p>
//                     </div>

//                     <div className="bg-gray-700 p-4 rounded-lg">
//                         <p className="text-sm text-gray-400">Amount</p>
//                         <p className="text-xl font-bold text-teal-400">
//                             ₹{paymentDetails?.finalPrice}
//                         </p>
//                     </div>
//                 </div>

//                 <button
//                     onClick={processPayment}
//                     disabled={processing}
//                     className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
//                 >
//                     {processing ? 'Processing...' : 'Confirm Payment'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default PaymentPortal;