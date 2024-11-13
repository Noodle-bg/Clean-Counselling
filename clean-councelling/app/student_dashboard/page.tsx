// app/student_dashboard/page.tsx
'use client'
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Loader2, User, Mail, Phone, Users } from 'lucide-react';
import PreferencesForm from '@/components/STUDENT_END/PreferencesForm';
import RoundTimer from '@/components/COMMON_END/RoundTimer';
import AllocationResults from '@/components/STUDENT_END/AllocationResults';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {query } from '@/lib/db';

interface AllocationResult {
    College_Name: string;
    Course_Name: string;
    Round_Number: number;
    Status: 'allocated' | 'not allocated';
    Decision: 'freeze' | 'slide' | null;
    has_frozen: boolean;
}

export default function StudentDashboard() {
    const { user } = useUser();
    const router = useRouter();
    const [showPreferencesForm, setShowPreferencesForm] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [allocation, setAllocation] = useState<AllocationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePreferencesClick = async () => {
        try {
          setLoading(true);
          
          // First check if preferences are frozen
          const freezeResponse = await fetch(`/api/STUDENT_END/freeze/${user.Student_id}`);
          const freezeData = await freezeResponse.json();
    
          if (freezeData.has_frozen) {
            setError('Your preferences have been frozen and cannot be modified');
            return;
          }
    
          // Then check if round is active
          const response = await fetch('/api/STUDENT_END/preferences/check-round');
          const data = await response.json();
          
          if (!data.canSubmitPreferences) {
            setError(data.message);
            return;
          }
    
          setShowPreferencesForm(true);
          setError(null);
        } catch (error) {
          setError('Failed to check preferences status');
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };
    

    const handleViewResults = async () => {
        if (!user?.Student_id) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/STUDENT_END/allocation/${user.Student_id}`);
            const data = await response.json();

            if (response.ok) {
                setAllocation(data);
                setShowResults(true);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch results');
            }
        } catch (error) {
            setError('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (decision: 'freeze' | 'slide') => {
        if (!user?.Student_id) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/STUDENT_END/allocation/${user.Student_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            // Refresh allocation data
            await handleViewResults();
        } catch (error) {
            setError('Failed to submit decision');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                    <span className="text-gray-200">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Timer Section */}
            <div className="fixed top-4 right-4 w-80 z-10">
                <RoundTimer />
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Profile Section */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h1 className="text-4xl font-bold text-teal-400 mb-6">
                        Welcome, {user.Student_name}
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-teal-400" />
                            <div>
                                <p className="text-sm text-gray-400">Rank</p>
                                <p className="text-lg font-semibold">{user.student_rank}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-teal-400" />
                            <div>
                                <p className="text-sm text-gray-400">Category</p>
                                <p className="text-lg font-semibold">{user.Category}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-teal-400" />
                            <div>
                                <p className="text-sm text-gray-400">Email</p>
                                <p className="text-lg font-semibold">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-teal-400" />
                            <div>
                                <p className="text-sm text-gray-400">Phone</p>
                                <p className="text-lg font-semibold">{user.Phone_Number}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Messages */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={handlePreferencesClick}
                        disabled={loading || allocation?.has_frozen}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2
                            ${loading || allocation?.has_frozen
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-teal-600 hover:bg-teal-700'}`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {allocation?.has_frozen ? 'Preferences Locked' : 'Edit Preferences'}
                    </button>
                    <button
                        onClick={handleViewResults}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        View Results
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Results Section */}
                {showResults && (
                    <div className="mb-8">
                        <AllocationResults
                            allocation={allocation}
                            onDecisionSubmit={handleDecision}
                            loading={loading}
                            loginId={user?.Student_id} //

                        />
                    </div>
                )}

                {/* Preferences Form Modal */}
                {showPreferencesForm && (
                    <PreferencesForm
                        studentId={user.Student_id}
                        onCancel={() => setShowPreferencesForm(false)}
                    />
                )}
            </div>
        </div>
    );
}