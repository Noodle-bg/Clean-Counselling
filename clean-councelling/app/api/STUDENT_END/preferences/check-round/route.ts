// app/api/STUDENT_END/preferences/check-round/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
    const connection = await getConnection();

    try {
        const [currentRound] = await connection.query(`
            SELECT Round_Number, Session_Name, start_Date, end_date
            FROM CounselingSessions
            WHERE CURRENT_TIMESTAMP() BETWEEN start_Date AND end_date
        `);

        if (!currentRound[0]) {
            return NextResponse.json({
                canSubmitPreferences: false,
                message: "Preferences can only be updated during active counseling rounds"
            });
        }

        return NextResponse.json({
            canSubmitPreferences: true,
            currentRound: currentRound[0]
        });
    } catch (error) {
        console.error('Error checking round status:', error);
        return NextResponse.json(
            { error: 'Failed to check round status' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}