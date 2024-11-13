//app/api/STUDENT_END/payments/price/[studentId]/route.ts
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
      console.log('Received studentId:', studentId);
  
      const [rows] = await connection.execute(
        `
        WITH StudentCategory AS (
        SELECT s.Category
        FROM Students s
        JOIN LoginInfo li ON li.Login = ?
        WHERE s.Student_Id = li.Student_Id
    ),
    FeePercentage AS (
        SELECT ci.Fee_Percentage
        FROM CategoryInfo ci
        JOIN StudentCategory sc ON ci.Category = sc.Category
    )
    SELECT fa.Student_Name, 
        co.Seat_Freezing_Price * fp.Fee_Percentage AS Seat_Freezing_Price
    FROM Final_Allocations_Name fa
    JOIN Colleges co ON fa.College_Name = co.College_Name
    JOIN LoginInfo li ON fa.Student_Name = li.Login_Id
    JOIN FeePercentage fp ON 1 = 1
    WHERE li.Login = ?;
        `,
        [studentId,studentId]
      );
      
      const formattedResponse = {
        success: true,
        data: rows,
        message: Array.isArray(rows) && rows.length > 0 ? 'Cost found' : 'No cost found'
      };
      console.log('API Response:', formattedResponse);
      
      return NextResponse.json(formattedResponse);
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json({
        success: false,
        data: null,
        message: 'Error fetching cost results'
      }, { status: 500 });
    } finally {
      connection.release();
    }
  }

