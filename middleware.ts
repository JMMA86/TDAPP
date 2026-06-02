import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth-secret';

const SECRET = JWT_SECRET;

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout', // must be reachable even with an expired/invalid token
];

// Static asset extensions served by Next.js — exempt from auth
const STATIC_EXT = /\.(?:ico|png|jpg|jpeg|svg|webp|css|js|woff2?|ttf|map)$/i;

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (pathname.startsWith('/_next')) return true;
  if (STATIC_EXT.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    // Redirect already-authenticated users away from auth pages
    if (pathname === '/login' || pathname === '/register') {
      const token = request.cookies.get('tdapp-token')?.value;
      if (token) {
        try {
          await jwtVerify(token, SECRET);
          return NextResponse.redirect(new URL('/', request.url));
        } catch {
          // expired/invalid — let them through to the auth page
        }
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get('tdapp-token')?.value;

  if (pathname.startsWith('/api/')) {
    if (!token) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      return Response.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
  }

  // Protected page routes
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
