// app/api/STUDENT_END/payments/portal/[studentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db';

interface RequestParams {
  params: {
    studentId: string;  // This will be the login (e.g., alice.smith)
  }
}

interface LoginInfoRow {
  Student_Id: number;
}

export async function POST(req: NextRequest, { params }: RequestParams) {
  try {
    const body = await req.json();
    const { loginId, amount, paymentId } = body;
    const loginUsername = params.studentId; // This is alice.smith

    // Validate inputs
    if (!loginUsername || !loginId || !amount || !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Initialize response data outside transaction
    let responseData = {
      payment_id: paymentId,
      student_id: 0, // Will be updated with actual ID
      login_id: loginId,
      amount: amount,
      payment_date: currentDateTime,
      status: 'completed' as const
    };

    await transaction(async (connection) => {
      // First get the actual Student_Id from LoginInfo
      const [loginRows] = await connection.execute(
        `SELECT Student_Id 
         FROM LoginInfo 
         WHERE Login = ?`,
        [loginUsername]
      );

      const loginInfo = (loginRows as LoginInfoRow[])[0];
      
      if (!loginInfo || !loginInfo.Student_Id) {
        throw new Error('Student not found in login information');
      }

      responseData.student_id = loginInfo.Student_Id;

      // Now insert into Payments with the correct Student_Id
      await connection.execute(
        `INSERT INTO Payments (
          Payment_Id,
          Student_Id,
          Amount,
          Payment_Date,
          Status
        ) VALUES (?, ?, ?, ?, ?)`,
        [paymentId, loginInfo.Student_Id, amount, currentDateTime, 'completed']
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}