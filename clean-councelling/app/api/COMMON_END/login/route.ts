// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getConnection } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { userType, loginId, password } = await req.json();

        if (!userType || !loginId || !password) {
            return NextResponse.json({ message: 'Missing login information.' }, { status: 400 });
        }

        // Logging input data
        console.log('Received userType:', userType, 'loginId:', loginId);

        const connection = await getConnection();
        console.log('Database connection established');

        let query = '';
        if (userType === 'student') {
            query = `SELECT * FROM LoginInfo WHERE Type='student' AND Login=? AND Password=?`;
        } else if (userType === 'college') {
            query = `SELECT * FROM LoginInfo WHERE Type='college' AND Login=? AND Password=?`;
        } else {
            return NextResponse.json({ message: 'Invalid user type' }, { status: 400 });
        }

        const [rows] = await connection.execute(query, [loginId, password]);

        if (rows) {
            if (userType === 'student') {
                // Fetch student details
                const studentQuery = `select student_rank,email,Student_name,Phone_Number,Parent_name,Category,Student_id from Students where student_id = 
(select student_id from LoginInfo where type = 'student' and login=? and password=?);`; // complex query3? 
                const [studentDetails] = await connection.execute(studentQuery, [loginId, password]);
                console.log("query executed")
                return NextResponse.json({
                    message: 'Student Login successful',
                    data: studentDetails
                });
            }
            else if (userType === 'college') {
                const query = `SELECT College_Name, Seat_Freezing_price, Total_Seats, Course_Name 
FROM SeatDistribution 
NATURAL JOIN Colleges 
NATURAL JOIN Courses 
WHERE College_Id = (
    SELECT College_Id 
    FROM LoginInfo 
    WHERE type = 'college' 
    AND login = ? 
    AND password = ?
);
`; // nested 1 
                const [details] = await connection.execute(query, [loginId, password])
                console.log("query executed");
                return NextResponse.json({
                    message: 'College Login Successful',
                    data: details
                })
            }
        } else {
            await connection.end();
            return NextResponse.json({ message: 'Invalid login credentials' }, { status: 401 });
        }
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
