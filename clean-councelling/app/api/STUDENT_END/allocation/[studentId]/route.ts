// app/api/STUDENT_END/allocation/[studentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { studentId: string } }
) {
    const connection = await getConnection();

    try {
        // First check if we're in between rounds
        const [currentRound] = await connection.query(`
            SELECT Round_Number
            FROM CounselingSessions
            WHERE CURRENT_TIMESTAMP() BETWEEN start_Date AND end_date
        `);
        console.log("round:", currentRound);

        if (currentRound[0]) {
            return NextResponse.json({
                message: "Results will be available after the current round ends"
            }, { status: 403 });
        }

        // If not in between rounds, try to get existing allocation
        const [allocation] = await connection.query(`
            SELECT 
                c.College_Name,
                co.Course_Name,
                sa.Round_Id AS Round_Number,
                sa.Status,
                sa.Decision,
                s.has_frozen
            FROM Students s
            LEFT JOIN SeatAllocation sa ON s.Student_Id = sa.Student_Id
            LEFT JOIN Colleges c ON sa.College_Id = c.College_Id
            LEFT JOIN Courses co ON sa.Course_Id = co.Course_Id
            WHERE s.Student_Id = ?
            AND sa.Round_Id IS NOT NULL  -- Add this condition
            ORDER BY sa.Round_Id DESC
            LIMIT 1
        `, [params.studentId]);
        console.log("allocation", allocation);

        // Modified condition: Check if no allocation exists or if all relevant fields are null
        if (!allocation[0] || (!allocation[0].Round_Number && !allocation[0].Status)) {
            console.log("No valid allocation found, running allocation procedure");
            // Check if there are any completed rounds
            const [lastRound] = await connection.query(`
                SELECT Round_Number
                FROM CounselingSessions
                WHERE end_date < CURRENT_TIMESTAMP()
                ORDER BY Round_Number DESC
                LIMIT 1
            `);

            if (!lastRound[0]) {
                return NextResponse.json({
                    message: "No completed rounds available for allocation"
                }, { status: 404 });
            }

            // Run allocation procedure
            await connection.query('CALL AllocateSeats()');

            // Fetch new allocation
            const [newAllocation] = await connection.query(`
                SELECT 
                    c.College_Name,
                    co.Course_Name,
                    sa.Round_Id AS Round_Number,
                    sa.Status,
                    sa.Decision,
                    s.has_frozen
                FROM Students s
                LEFT JOIN SeatAllocation sa ON s.Student_Id = sa.Student_Id
                LEFT JOIN Colleges c ON sa.College_Id = c.College_Id
                LEFT JOIN Courses co ON sa.Course_Id = co.Course_Id
                WHERE s.Student_Id = ?
                AND sa.Round_Id IS NOT NULL
                ORDER BY sa.Round_Id DESC
                LIMIT 1
            `, [params.studentId]);
            console.log("New allocation after procedure:", newAllocation);

            if (!newAllocation[0]) {
                return NextResponse.json({
                    message: "No seat allocated in this round"
                }, { status: 404 });
            }

            return NextResponse.json(newAllocation[0]);
        }

        return NextResponse.json(allocation[0]);
    } catch (error) {
        console.error('Error fetching allocation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch allocation' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}

// PUT handler remains the same...

export async function PUT(
    req: NextRequest,
    { params }: { params: { studentId: string } }
) {
    const connection = await getConnection();

    try {
        const { decision } = await req.json();
        console.log("decision taken",decision)

        if (!['freeze', 'slide'].includes(decision)) {
            return NextResponse.json(
                { error: 'Invalid decision' },
                { status: 400 }
            );
        }

        const [roundCheck] = await connection.query(`
            SELECT Round_Number
            FROM CounselingSessions
            WHERE CURRENT_TIMESTAMP() BETWEEN start_Date AND end_date
        `);

        if (roundCheck[0]) {
            return NextResponse.json(
                { error: 'Decisions can only be made between rounds' },
                { status: 403 }
            );
        }

        // Get latest allocation
        const [currentAllocation] = await connection.query(`
            SELECT * FROM SeatAllocation
            WHERE Student_Id = ?
            ORDER BY Round_Id DESC
            LIMIT 1
        `, [params.studentId]);
        console.log("latest allocation",currentAllocation)
            
        if (!currentAllocation[0] || currentAllocation[0].Status !== 'allocated') {
            return NextResponse.json(
                { error: 'No valid allocation found' },
                { status: 404 }
            );
        }

        // Update decision
        await connection.query(`
            UPDATE SeatAllocation
            SET Decision = ?
            WHERE Student_Id = ? AND Round_Id = ?
        `, [decision, params.studentId, currentAllocation[0].Round_Id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating decision:', error);
        return NextResponse.json(
            { error: 'Failed to update decision' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}