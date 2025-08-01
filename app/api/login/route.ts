import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('adminName', username, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}
