import { NextResponse } from 'next/server';
import {
  PORTAL_SESSION_COOKIE,
  createAuthorizationCode,
  getClient,
  isAllowedRedirect,
  readPortalSession,
} from '@/lib/sso';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id') || '';
  const redirectUri = url.searchParams.get('redirect_uri') || '';
  const state = url.searchParams.get('state') || '';
  const client = getClient(clientId);

  if (!client || !redirectUri || !isAllowedRedirect(client, redirectUri)) {
    return NextResponse.json({ message: 'Invalid SSO client or redirect URI' }, { status: 400 });
  }

  const session = readPortalSession(req.headers.get('cookie')?.match(new RegExp(`${PORTAL_SESSION_COOKIE}=([^;]+)`))?.[1]);
  if (!session) {
    const loginUrl = new URL('/login', url.origin);
    loginUrl.searchParams.set('returnTo', `${url.pathname}${url.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set('code', createAuthorizationCode(session.email, client.id, redirectUri));
  if (state) {
    callbackUrl.searchParams.set('state', state);
  }

  return NextResponse.redirect(callbackUrl);
}
