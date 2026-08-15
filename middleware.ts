import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public landing, assets, API routes, and login
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check for presence of session token (Supabase auth cookie)
  const token = req.cookies.get('sb-access-token')?.value || req.cookies.get('supabase-auth-token')?.value;

  // If no auth token is present and trying to access portal routes, redirect to /login
  if (!token && pathname.startsWith('/portal')) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/portal'],
};
