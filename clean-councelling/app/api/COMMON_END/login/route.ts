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
(select student_id from logininfo where type = 'student' and login=? and password=?);`;
                const [studentDetails] = await connection.execute(studentQuery, [loginId, password]);
                console.log("query executed")
                return NextResponse.json({
                    message: 'Student Login successful',
                    data: studentDetails
                });
            }
            else if (userType === 'college') {
                const query = `SELECT college_name,seat_freezing_price,total_seats,course_name FROM
                seatDistribution NATURAL JOIN colleges NATURAL JOIN courses WHERE
                college_id = (
                SELECT college_id FROM loginInfo WHERE
                type = 'college' AND login = ? AND password = ?
                );`;
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
