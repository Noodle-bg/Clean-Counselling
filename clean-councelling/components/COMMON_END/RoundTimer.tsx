import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface RoundInfo {
    Round_Number: number;
    Session_Name: string;
    start_Date: string;
    end_date: string;
    round_status: 'current' | 'next' | 'completed';
    timeRemaining: number;
    next_round_number: number | null;
    next_round_start: string | null;
}

export default function RoundTimer() {
    const [roundInfo, setRoundInfo] = useState<RoundInfo | null>(null);
    const [timeDisplay, setTimeDisplay] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const fetchRoundInfo = async () => {
        try {
            const response = await fetch('/api/COMMON_END/currentRound');
            const data = await response.json();
            if (data.currentRound) {
                setRoundInfo(data.currentRound);
                // If the current round is ending, schedule the next update
                if (data.currentRound.timeRemaining <= 0) {
                    setTimeout(fetchRoundInfo, 1000);
                }
            }
        } catch (error) {
            console.error('Error fetching round info:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoundInfo();
        // Refresh round info every minute
        const interval = setInterval(fetchRoundInfo, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!roundInfo) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            let timeRemaining = roundInfo.timeRemaining - (new Date().getTime() - now);

            if (timeRemaining < 0) {
                // If time expired and we have next round info, fetch new round status
                if (roundInfo.next_round_number) {
                    fetchRoundInfo();
                    return;
                }
                setTimeDisplay('All rounds completed');
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            const display = roundInfo.round_status === 'current'
                ? `Round ${roundInfo.Round_Number} ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`
                : `Round ${roundInfo.Round_Number} starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`;

            setTimeDisplay(display);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [roundInfo]);

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    if (!roundInfo) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="text-gray-400 w-5 h-5" />
                <p className="text-gray-400">No active rounds scheduled</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-semibold text-teal-400">
                    {roundInfo.Session_Name}
                </h3>
            </div>
            <p className="text-white font-mono">{timeDisplay}</p>
            {roundInfo.next_round_number && (
                <p className="text-gray-400 text-sm mt-2">
                    Next: Round {roundInfo.next_round_number}
                </p>
            )}
        </div>
    );
}