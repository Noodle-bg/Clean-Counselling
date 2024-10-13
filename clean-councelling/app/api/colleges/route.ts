// app/api/colleges/route.ts
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';

export async function GET() {
  const connection = await getConnection();
  const [rows] = await connection.execute('SELECT College_Name, Seat_Freezing_Price FROM Colleges');
  connection.end();
  
  return NextResponse.json({ colleges: rows });
}
