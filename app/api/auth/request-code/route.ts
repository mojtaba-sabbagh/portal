import { NextResponse } from 'next/server';
import { sendLoginCode } from '@/lib/mail';
import {
  LOGIN_CHALLENGE_COOKIE,
  createLoginChallenge,
  generateLoginCode,
  isAllowedEmail,
  isValidEmail,
  normalizeEmail,
} from '@/lib/sso';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(String(body.email || ''));

  if (!isValidEmail(email) || !isAllowedEmail(email)) {
    return NextResponse.json({ message: 'ایمیل مجاز نیست' }, { status: 400 });
  }

  const code = generateLoginCode();
  const mailResult = await sendLoginCode(email, code);
  const responseBody: { success: boolean; devCode?: string } = { success: true };

  if (mailResult.devCode && process.env.NODE_ENV !== 'production') {
    responseBody.devCode = mailResult.devCode;
  }

  const response = NextResponse.json(responseBody);
  response.cookies.set(LOGIN_CHALLENGE_COOKIE, createLoginChallenge(email, code), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}
