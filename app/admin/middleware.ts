import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPath = request.nextUrl.pathname === '/login';

  // Don't block access to login page
  if (isLoginPath) return NextResponse.next();

  // Check if "adminName" exists in cookies or headers
  const hasAdminSession = request.cookies.get('adminName')?.value;

  // NOTE: We’re only using localStorage in the browser so middleware can't access it
  // This check only works if you eventually store session in cookie

  // TEMP: Block all /admin if no session detected
  if (isAdminPath && !hasAdminSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
