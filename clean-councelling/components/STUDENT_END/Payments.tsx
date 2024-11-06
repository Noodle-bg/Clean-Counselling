'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaymentDetails {
  Seat_Freezing_Price?: string | number;
}

const Payments = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginId = searchParams.get('loginId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    fetchPaymentDetails();
  }, [loginId]);

  const fetchPaymentDetails = async () => {
    if (!loginId) {
      setError('Login credentials are required');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching results for loginId:', loginId);
      const response = await fetch(`/api/STUDENT_END/payments/price/${loginId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('API Response:', data);


      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch results');
      }

      if (data.success && data.data && Array.isArray(data.data)) {
        if (data.data.length > 0) {
          setPaymentDetails(data.data[0]);
        } else {
          setError('No payment details found for your ID');
        }
      } else {
        setError(data.message || 'No payment details available');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails) return;

    const amount = Number(paymentDetails.Seat_Freezing_Price) || 0;
    alert(`Proceeding to payment of ₹${amount}`);
  };

  const handleCancel = () => {
    router.push('/'); 
    
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
        <div className="text-2xl">Loading payment details...</div>
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
          Return to Home
        </button>
      </div>
    );
  }

  const seatFreezingPrice = Number(paymentDetails?.Seat_Freezing_Price) || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-teal-400 mb-8 text-center">
          Payment Details
        </h1>

        <div className="space-y-6">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Seat Freezing Fee
            </h2>
            <p className="text-3xl font-bold text-teal-300">
              ₹{seatFreezingPrice.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              Important Notes:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Payment is non-refundable</li>
              <li>Seat will be confirmed after successful payment</li>
              <li>Generate receipt after payment completion</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={handlePayment}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Proceed to Payment
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
