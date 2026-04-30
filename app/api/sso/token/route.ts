import { NextResponse } from 'next/server';
import {
  createUserToken,
  getClient,
  getClientSecret,
  isAllowedRedirect,
  verifyAuthorizationCode,
} from '@/lib/sso';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const clientId = String(body.client_id || '');
  const clientSecret = String(body.client_secret || '');
  const code = String(body.code || '');
  const redirectUri = String(body.redirect_uri || '');

  const client = getClient(clientId);
  const expectedSecret = client ? getClientSecret(client) : undefined;

  if (!client || !expectedSecret || expectedSecret !== clientSecret) {
    return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
  }

  const authorizationCode = verifyAuthorizationCode(code);
  if (
    !authorizationCode ||
    authorizationCode.clientId !== client.id ||
    authorizationCode.redirectUri !== redirectUri ||
    !isAllowedRedirect(client, redirectUri)
  ) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  return NextResponse.json({
    token_type: 'Bearer',
    expires_in: 60 * 60 * 8,
    id_token: createUserToken(authorizationCode.email, client.id, 'id'),
    access_token: createUserToken(authorizationCode.email, client.id, 'access'),
    user: {
      email: authorizationCode.email,
    },
  });
}
