// app/api/COMMON_END/currentRound/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
    const connection = await getConnection();
    
    try {
        const [results] = await connection.query('CALL GetCurrentRoundStatus()');
        
        // The procedure returns results as an array where the first element
        // contains our round information
        const roundInfo = results[0][0];
        
        if (!roundInfo) {
            return NextResponse.json({
                message: "No rounds scheduled"
            });
        }

        return NextResponse.json({
            currentRound: {
                ...roundInfo,
                // Convert timestamps to ISO strings for JSON serialization
                start_Date: new Date(roundInfo.start_Date).toISOString(),
                end_date: new Date(roundInfo.end_date).toISOString(),
                next_round_start: roundInfo.next_round_start ? 
                    new Date(roundInfo.next_round_start).toISOString() : null
            }
        });
    } catch (error) {
        console.error('Error fetching round info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch round information' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}