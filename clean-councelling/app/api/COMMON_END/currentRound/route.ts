// app/api/COMMON_END/currentRound/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
    const connection = await getConnection();

    try {
        // Get current or next round
        const [rounds] = await connection.query(`
            SELECT Round_Number, Session_Name, start_Date, end_date,
                CASE
                    WHEN CURRENT_TIMESTAMP() BETWEEN start_Date AND end_date THEN 'current'
                    WHEN start_Date > CURRENT_TIMESTAMP() THEN 'next'
                    ELSE 'completed'
                END as round_status
            FROM CounselingSessions
            WHERE start_Date >= CURRENT_DATE()
                OR CURRENT_TIMESTAMP() BETWEEN start_Date AND end_date
            ORDER BY start_Date
            LIMIT 1
        `);

        if (!rounds[0]) {
            return NextResponse.json({ 
                message: "No upcoming rounds scheduled" 
            });
        }

        const roundInfo = rounds[0];
        
        // Calculate time remaining
        const now = new Date();
        const startDate = new Date(roundInfo.start_Date);
        const endDate = new Date(roundInfo.end_date);

        let timeRemaining;
        if (roundInfo.round_status === 'next') {
            timeRemaining = startDate.getTime() - now.getTime();
        } else if (roundInfo.round_status === 'current') {
            timeRemaining = endDate.getTime() - now.getTime();
        }

        return NextResponse.json({
            currentRound: {
                ...roundInfo,
                timeRemaining
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