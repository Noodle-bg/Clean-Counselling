// app/api/collegesWithCourses/route.ts
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
    const connection = await getConnection();
    const [rows, fields]: [any[], any[]] = await connection.query(`
        SELECT Colleges.College_Id, Colleges.College_Name, Courses.Course_Id, Courses.Course_Name
        FROM Colleges
        JOIN SeatDistribution ON Colleges.College_Id = SeatDistribution.College_Id
        JOIN Courses ON SeatDistribution.Course_Id = Courses.Course_Id
    `);
    connection.end();

    const data = rows.reduce((acc: Record<string, any>, row: any) => {
        if (!acc[row.College_Name]) {
            acc[row.College_Name] = { collegeId: row.College_Id, courses: [] };
        }
        acc[row.College_Name].courses.push({ courseId: row.Course_Id, courseName: row.Course_Name });
        return acc;
    }, {});
    console.log("data: ", data)
    console.log("info in data courses for Engineering College A", data["Engineering College A"]["courses"])

    return NextResponse.json(data);
}
