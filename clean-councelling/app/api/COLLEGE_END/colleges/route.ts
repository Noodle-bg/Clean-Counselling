// app/api/colleges/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getConnection } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { loginId, password } = await req.json();
        const query = `
            SELECT College_Name, Course_Name, Total_Seats, 
                   ROUND(Total_Seats * (SELECT Seat_Percentage FROM CategoryInfo WHERE Category = 'General')) AS General_Seats, 
                   ROUND(Total_Seats * (SELECT Seat_Percentage FROM CategoryInfo WHERE Category = 'OBC')) AS OBC_Seats, 
                   ROUND(Total_Seats * (SELECT Seat_Percentage FROM CategoryInfo WHERE Category = 'SC/ST')) AS SC_ST_Seats,
                   Seat_Freezing_price,
                   Seat_Freezing_price * ((SELECT Seat_Percentage FROM CategoryInfo WHERE Category = 'General')) AS General_Price,
                   Seat_Freezing_price *((SELECT Seat_Percentage FROM CategoryInfo WHERE Category = 'OBC')) AS OBC_Price,
                   Seat_Freezing_price * ((SELECT Seat_Percentage FROM CategoryInfo WHERE Category = 'SC/ST')) AS SC_ST_Price
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
        `;
        // nested 2 
        const connection = await getConnection();

        const [details] = await connection.execute(query, [loginId, password]); 

        if (Array.isArray(details) && details.length > 0) {
            return NextResponse.json({
                message: 'College Login Successful',
                data: details
            });
        } else {
            return NextResponse.json({ message: 'Invalid login credentials.' }, { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
