// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { authenticateUser } from '../../../lib/auth';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    const user = await authenticateUser(username, password);
    if (user) {
      // Here you would typically set a session or JWT token
      // For now, we'll just return the user info
      return NextResponse.json({ success: true, user });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 });
  }
}
