import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export async function PUT(req: NextRequest) {
    let connection;
    try {
        const { collegeName, courseName, totalSeats, seatFreezingPrice } = await req.json();

        if (totalSeats < 0 || seatFreezingPrice < 0) {
            return NextResponse.json({ message: 'Invalid input values' }, { status: 400 });
        }

        connection = await getConnection();

        // Start transaction
        await connection.beginTransaction();

        // Use collegeName to fetch College_Id and ensure the return type is RowDataPacket[]
        const [college] = await connection.execute<RowDataPacket[]>(
            `SELECT College_Id FROM Colleges WHERE College_Name = ?`,
            [collegeName]
        );

        if (college.length === 0) {
            return NextResponse.json({ message: 'College not found' }, { status: 404 });
        }

        const collegeId = college[0].College_Id;

        // Calculate the updated seat distribution values
        const generalSeats = Math.floor(totalSeats * 0.55);
        const obcSeats = Math.floor(totalSeats * 0.15);
        const scstSeats = Math.floor(totalSeats * 0.30);

        // Update seat and price data in SeatDistribution and Colleges
        await connection.execute(
            `UPDATE SeatDistribution AS s 
             JOIN Colleges AS c ON s.College_Id = c.College_Id 
             SET s.Total_Seats = ?, c.Seat_Freezing_Price = ?, s.remaining_general = ?, s.remaining_obc = ?, s.remaining_scst = ?
             WHERE s.College_Id = ? AND s.Course_Id IN (
                 SELECT Course_Id FROM Courses WHERE Course_Name = ?
             )`,
            [totalSeats, seatFreezingPrice, generalSeats, obcSeats, scstSeats, collegeId, courseName]
        );

        await connection.commit();

        return NextResponse.json({
            message: 'Seats and price updated successfully',
            data: { collegeName, courseName, totalSeats, seatFreezingPrice, generalSeats, obcSeats, scstSeats }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        return NextResponse.json({ message: 'Error updating records' }, { status: 500 });
    }
}