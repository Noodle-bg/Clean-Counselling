// app/api/STUDENT_END/freeze/[studentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';


export async function GET(
    req: NextRequest,
    { params }: { params: { studentId: string } }
) {
    const connection = await getConnection();

    try {
        const [freezeStatus]: [{ has_frozen: boolean }[], any] = await connection.query(`
            SELECT has_frozen
            FROM Students
            WHERE Student_Id = ?
        `, [params.studentId]);

            console.log("freezeStatus:", freezeStatus);

        if (!freezeStatus[0]) {
            return NextResponse.json({
                message: "Student not found"
            }, { status: 404 });
        }
        return NextResponse.json({
            has_frozen: freezeStatus[0].has_frozen
        });
       
    }
    catch (error) {
        console.error('Error fetching freeze:', error);
        return NextResponse.json(
            { error: 'Failed to fetch freeze' },
            { status: 500 }
        );
    }
    finally {
        connection.release();
    }
}





