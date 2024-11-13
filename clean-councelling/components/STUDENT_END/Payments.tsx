'use client';
//components/STUDENT_END/Payments.tsx
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');

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
    setShowPaymentForm(true);
  };

  const handleConfirmPayment = async () => {
    if (!paymentDetails) return;
    const amount = Number(paymentDetails.Seat_Freezing_Price) || 0;
    const paymentId = uuidv4(); 
    alert(`Proceeding to payment of ₹${amount} using ${paymentMethod}`);

    const response = await fetch(`/api/STUDENT_END/payments/portal/${loginId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: paymentId,    
        loginId: loginId,        
        amount: amount,          
      }),
    });
    const result = await response.json();

    if (result.success) {
      alert(`Payment processed successfully!\nPayment ID: ${paymentId}`);
      // You can add receipt generation or redirect logic here
      router.push('/student_dashboard'); // or wherever you want to redirect after success
    } 
    else{
      alert("Payment failed"); 
      
    }
        



    
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

  if (showPaymentForm) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-8 text-center">
            Payment Form
          </h1>

          <div className="space-y-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Login ID:</label>
                  <input
                    type="text"
                    value={loginId || ''}
                    readOnly
                    className="w-full p-2 bg-gray-600 text-gray-100 rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Amount:</label>
                  <input
                    type="text"
                    value={`₹${seatFreezingPrice.toLocaleString()}`}
                    readOnly
                    className="w-full p-2 bg-gray-600 text-gray-100 rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-gray-600 text-gray-100 rounded"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded flex-1"
                  >
                    Confirm Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex-1"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

           <button
            onClick={handlePayment}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 w-full"
          >
            Proceed to Payment
          </button>
          <button
            onClick={() => router.back()}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;