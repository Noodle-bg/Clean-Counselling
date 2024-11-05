import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';


export async function POST(req: NextRequest) {
    try {
        const {loginId, password} = await req.json();
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
        WHERE Student_Name = (
            SELECT Student_id
            FROM LoginInfo
            WHERE type = 'student'
            AND login = ?
            AND password = ?
        );
 `;
        const connection = await getConnection();

        const [details] = await connection.execute(query, [loginId, password]);

        if (Array.isArray(details) && details.length > 0) {
            return NextResponse.json({
                message: 'Result Successful',
                data: details
            });
        } else {
            return NextResponse.json({message: 'Invalid login credentials.'}, {status: 401});
        }
        
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
    }
}



    