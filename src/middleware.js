import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!token;
  const isAdmin = token?.role === 'ADMIN';

  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/checkout');
  const isAuthRoute = pathname.startsWith('/auth');

  if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)'],
};
