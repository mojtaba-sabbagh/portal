import { NextResponse } from 'next/server';
import {
  LOGIN_CHALLENGE_COOKIE,
  PORTAL_SESSION_COOKIE,
  createPortalSession,
  getSessionMaxAgeSeconds,
  verifyLoginChallenge,
} from '@/lib/sso';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || '');
  const email = verifyLoginChallenge(req.headers.get('cookie')?.match(new RegExp(`${LOGIN_CHALLENGE_COOKIE}=([^;]+)`))?.[1], code);

  if (!email) {
    return NextResponse.json({ message: 'کد ورود معتبر نیست' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, email });
  response.cookies.set(PORTAL_SESSION_COOKIE, createPortalSession(email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: getSessionMaxAgeSeconds(),
  });
  response.cookies.set(LOGIN_CHALLENGE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
