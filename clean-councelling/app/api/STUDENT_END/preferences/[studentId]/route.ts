// app/api/preferences/[studentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface PreferenceRow extends RowDataPacket {
    College_Id: number;
    Course_Id: number;
    Preference_Order: number;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { studentId: string } }
) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query<PreferenceRow[]>(
            `SELECT College_Id, Course_Id, Preference_Order 
             FROM Preferences 
             WHERE Student_Id = ? 
             ORDER BY Preference_Order`,
            [params.studentId]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch preferences' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { studentId: string } }
) {
    const connection = await getConnection();

    try {
        const preferences = await req.json();

        // Convert preferences array to JSON string for the procedure
        const preferencesJson = JSON.stringify(preferences);

        // Call the new stored procedure
        await connection.query(
            'CALL UpdateStudentPreferences(?, ?)',
            [params.studentId, preferencesJson]
        );

        return NextResponse.json({
            message: 'Preferences updated successfully'
        });

    } catch (error) {
        console.error('Error updating preferences:', error);

        // Extract MySQL error message if available
        let errorMessage = 'Failed to update preferences';
        if (error instanceof Error) {
            // Handle specific MySQL errors
            if ('sqlMessage' in error) {
                errorMessage = (error as any).sqlMessage;
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    } finally {
        connection.release();
    }
}