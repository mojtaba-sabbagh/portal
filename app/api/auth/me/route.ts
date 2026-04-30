import { NextResponse } from 'next/server';
import { PORTAL_SESSION_COOKIE, readPortalSession } from '@/lib/sso';

export async function GET(req: Request) {
  const session = readPortalSession(req.headers.get('cookie')?.match(new RegExp(`${PORTAL_SESSION_COOKIE}=([^;]+)`))?.[1]);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
    },
  });
}
