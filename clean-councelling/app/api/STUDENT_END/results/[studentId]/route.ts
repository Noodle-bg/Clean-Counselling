import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

interface RequestParams {
  params: {
    studentId: string;
  }
}

export async function GET(req: NextRequest, { params }: RequestParams) {
  const connection = await getConnection();
  try {
    const { studentId } = params;
    
    await connection.execute(`CALL seat_allocation_results()`);
    console.log('Received studentId:', studentId);

    const [rows] = await connection.execute(
      `SELECT * FROM Final_Allocations_Name WHERE Student_Name = (SELECT Login_Id FROM LoginInfo WHERE Login = ?)`,
      [studentId]
    );
    
    const formattedResponse = {
      success: true,
      data: rows,
      message: Array.isArray(rows) && rows.length > 0 ? 'Allocation found' : 'No allocation found'
    };
    console.log('API Response:', formattedResponse);
    
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      data: null,
      message: 'Error fetching allocation results'
    }, { status: 500 });
  } finally {
    connection.release();
  }
}