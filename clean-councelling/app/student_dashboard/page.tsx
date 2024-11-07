'use client';

import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import PreferencesForm from '../../components/STUDENT_END/PreferencesForm';

export default function StudentDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const [error, setError] = useState('');

  const handleShowResults = async () => {
    try {
      // Get stored credentials from sessionStorage (safer than localStorage)
      const storedPassword = sessionStorage.getItem('studentPassword');
      const storedLoginId = sessionStorage.getItem('studentLoginId');

      if (!storedLoginId || !storedPassword) {
        setError('Login credentials not found. Please login again.');
        setTimeout(() => router.push('/'), 2000); // Redirect after 2 seconds
        return;
      }

      router.push(`/results?loginId=${storedLoginId}&password=${storedPassword}`);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to access results. Please try logging in again.');
      setTimeout(() => router.push('/'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-8">
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-4 fixed top-4 right-4">
          {error}
        </div>
      )}
      
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-teal-400 mb-6 text-center">
          Welcome, {user?.Student_name}
        </h1>
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
            onClick={() => setShowPreferencesForm(!showPreferencesForm)}
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
      
      <div className="flex gap-4 mt-8">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 transition"
          onClick={() => {
            sessionStorage.clear(); // Clear stored credentials on logout
            router.push('/');
          }}
        >
          Logout
        </button>
        <button
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition"
          onClick={handleShowResults}
        >
          Show Results
        </button>
      </div>
    </div>
  );
}