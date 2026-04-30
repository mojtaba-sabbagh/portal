import crypto from 'crypto';

export type SsoClient = {
  id: string;
  name: string;
  redirectUris: string[];
  secret?: string;
};

export type PortalSession = {
  email: string;
  exp: number;
  iat: number;
};

type SignedPayload<T> = T & {
  exp: number;
  iat: number;
};

const encoder = new TextEncoder();

export const PORTAL_SESSION_COOKIE = 'portal_sso_session';
export const LOGIN_CHALLENGE_COOKIE = 'portal_login_challenge';

const DEFAULT_SESSION_SECONDS = 60 * 60 * 8;
const DEFAULT_CODE_SECONDS = 60 * 2;
const DEFAULT_LOGIN_CHALLENGE_SECONDS = 60 * 10;

export function getSsoIssuer() {
  return process.env.SSO_ISSUER || process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000';
}

export function getSessionMaxAgeSeconds() {
  return Number(process.env.SSO_SESSION_SECONDS || DEFAULT_SESSION_SECONDS);
}

export function getClients(): SsoClient[] {
  if (!process.env.SSO_CLIENTS) {
    return [
      {
        id: 'suggestion',
        name: 'سامانه پیشنهادات',
        redirectUris: [`${getSsoIssuer()}/suggestion`],
        secret: 'change-me',
      },
    ];
  }

  try {
    const clients = JSON.parse(process.env.SSO_CLIENTS) as SsoClient[];
    return Array.isArray(clients) ? clients : [];
  } catch {
    return [];
  }
}

export function getClient(clientId: string) {
  return getClients().find((client) => client.id === clientId);
}

export function isAllowedRedirect(client: SsoClient, redirectUri: string) {
  return client.redirectUris.includes(redirectUri);
}

export function getClientSecret(client: SsoClient) {
  return client.secret || process.env[`SSO_CLIENT_SECRET_${client.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`];
}

export function isAllowedEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const allowedDomains = (process.env.SSO_ALLOWED_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  if (allowedDomains.length === 0) {
    return true;
  }

  const domain = normalizedEmail.split('@')[1];
  return allowedDomains.includes(domain);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function signValue<T extends Record<string, unknown>>(payload: T, maxAgeSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SignedPayload<T> = {
    ...payload,
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createSignature(body);

  return `${body}.${signature}`;
}

export function verifyValue<T extends Record<string, unknown>>(value?: string | null): SignedPayload<T> | null {
  if (!value) return null;

  const [body, signature] = value.split('.');
  if (!body || !signature) return null;

  const expected = createSignature(body);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SignedPayload<T>;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createPortalSession(email: string) {
  return signValue<PortalSession>(
    {
      email: normalizeEmail(email),
      exp: 0,
      iat: 0,
    },
    getSessionMaxAgeSeconds(),
  );
}

export function readPortalSession(cookieValue?: string | null) {
  const session = verifyValue<PortalSession>(cookieValue);

  if (!session?.email) {
    return null;
  }

  return session;
}

export function createLoginChallenge(email: string, code: string) {
  return signValue(
    {
      email: normalizeEmail(email),
      codeHash: hashLoginCode(code),
    },
    DEFAULT_LOGIN_CHALLENGE_SECONDS,
  );
}

export function verifyLoginChallenge(cookieValue: string | undefined, code: string) {
  const challenge = verifyValue<{ email: string; codeHash: string }>(cookieValue);
  if (!challenge) return null;

  const codeHash = hashLoginCode(code);
  if (!timingSafeEqual(challenge.codeHash, codeHash)) {
    return null;
  }

  return challenge.email;
}

export function createAuthorizationCode(email: string, clientId: string, redirectUri: string) {
  return signValue(
    {
      email: normalizeEmail(email),
      clientId,
      redirectUri,
      nonce: crypto.randomBytes(16).toString('hex'),
    },
    DEFAULT_CODE_SECONDS,
  );
}

export function verifyAuthorizationCode(code: string) {
  return verifyValue<{ email: string; clientId: string; redirectUri: string; nonce: string }>(code);
}

export function createUserToken(email: string, audience: string, tokenType: 'id' | 'access') {
  const now = Math.floor(Date.now() / 1000);

  return signJwt(
    {
      iss: getSsoIssuer(),
      aud: audience,
      sub: normalizeEmail(email),
      email: normalizeEmail(email),
      token_type: tokenType,
      iat: now,
      exp: now + getSessionMaxAgeSeconds(),
    },
    getSigningSecret(),
  );
}

export function generateLoginCode() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashLoginCode(code: string) {
  return crypto.createHmac('sha256', getSigningSecret()).update(code.trim()).digest('hex');
}

function createSignature(body: string) {
  return crypto.createHmac('sha256', getSigningSecret()).update(body).digest('base64url');
}

function getSigningSecret() {
  return process.env.SSO_SECRET || process.env.NEXTAUTH_SECRET || 'development-sso-secret-change-me';
}

function base64UrlEncode(value: string) {
  return Buffer.from(encoder.encode(value)).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');

  return `${header}.${body}.${signature}`;
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
