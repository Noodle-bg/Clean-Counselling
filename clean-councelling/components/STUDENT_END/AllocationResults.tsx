// app/components/STUDENT_END/AllocationResults.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, ArrowUpCircle, LockIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AllocationResult {
    College_Name: string;
    Course_Name: string;
    Round_Number: number;
    Status: 'allocated' | 'not allocated';
    Decision: 'freeze' | 'slide' | null;
    has_frozen: boolean;
}

interface AllocationResultsProps {
    allocation: AllocationResult | null;
    onDecisionSubmit: (decision: 'freeze' | 'slide') => Promise<void>;
    loading?: boolean;
}

export default function AllocationResults({
    allocation,
    onDecisionSubmit,
    loading = false
}: AllocationResultsProps) {
    if (loading) {
        return (
            <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
                <CardContent className="py-8">
                    <div className="animate-pulse flex flex-col items-center space-y-4">
                        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!allocation) {
        return (
            <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-gray-200">
                            Results Not Available
                        </h3>
                        <p className="text-gray-400">
                            Please check back after the current round ends.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isAllocated = allocation.Status === 'allocated';

    return (
        <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <span className="text-teal-400">Round {allocation.Round_Number} Results</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {isAllocated ? (
                    <>
                        <div className="flex items-center justify-center space-x-4">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <h2 className="text-2xl font-bold text-white">
                                Seat Allocated!
                            </h2>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-6 text-center space-y-3">
                            <h3 className="text-2xl font-semibold text-teal-400">
                                {allocation.College_Name}
                            </h3>
                            <p className="text-xl text-white">
                                {allocation.Course_Name}
                            </p>
                        </div>

                        {!allocation.has_frozen && !allocation.Decision && (
                            <div className="space-y-4">
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => onDecisionSubmit('freeze')}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    >
                                        <LockIcon className="w-5 h-5" />
                                        Freeze Seat
                                    </button>
                                    <button
                                        onClick={() => onDecisionSubmit('slide')}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <ArrowUpCircle className="w-5 h-5" />
                                        Float for Next Round
                                    </button>
                                </div>
                                <p className="text-sm text-gray-400 text-center">
                                    Note: Selecting "Float" means you'll participate in the next round
                                    but might lose your current allocation if not assigned a higher preference.
                                </p>
                            </div>
                        )}

                        {(allocation.Decision || allocation.has_frozen) && (
                            <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                                <p className="text-gray-300">
                                    Your decision: {' '}
                                    <span className="text-teal-400 font-semibold capitalize">
                                        {allocation.has_frozen ? 'frozen' : allocation.Decision}
                                    </span>
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center space-y-4 py-6">
                        <AlertCircle className="h-12 w-12 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-gray-200">
                            No Seat Allocated
                        </h3>
                        <p className="text-gray-400">
                            No seat was allocated in this round. 
                            {!allocation.has_frozen && 
                                " Your preferences will be considered in the next round."}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
