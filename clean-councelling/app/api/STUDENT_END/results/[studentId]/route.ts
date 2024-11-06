// app/api/STUDENT_END/results/[studentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

interface RequestParams {
    params: {
        studentId: string;
    }
}

export async function GET(req: NextRequest, { params }: RequestParams) {
    try {
        const { studentId } = params;

        const query = `
            call seat_allocation_results;
            
            CREATE TABLE IF NOT EXISTS Final_Allocations_Name (
                Student_Name VARCHAR(255),
                Course_Name VARCHAR(255),
                College_Name VARCHAR(255),
                PRIMARY KEY (Student_Name, Course_Name, College_Name)
            );

            INSERT INTO Final_Allocations_Name (Student_Name, Course_Name, College_Name)
            SELECT
                s.Student_Id,
                c.Course_Name,
                co.College_Name
            FROM
                Final_Allocations fa
            JOIN
                Students s ON fa.Student_Id = s.Student_Id
            JOIN
                Courses c ON fa.Course_Id = c.Course_Id
            JOIN
                Colleges co ON fa.College_Id = co.College_Id;

            SELECT * from Final_Allocations_Name
            WHERE Student_Name = ?;
        `;
        // i wrote student_name instead of student_id for final_allocations_name, but it is actually student_id only 
        const connection = await getConnection();
        const [details] = await connection.execute(query, [studentId]);

        if (Array.isArray(details) && details.length > 0) {
            return NextResponse.json({
                message: 'Result Successful',
                data: details
            });
        } else {
            return NextResponse.json({ message: 'No results found.' }, { status: 404 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}