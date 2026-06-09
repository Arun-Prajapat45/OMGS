import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!token;
  const isAdmin = token?.role === 'ADMIN' || token?.role === 'MANAGER' || token?.role === 'admin' || token?.role === 'manager';

  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/checkout');
  const isAuthRoute = pathname.startsWith('/auth');

  let response = NextResponse.next();

  if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
    response = NextResponse.redirect(new URL('/auth/login', req.url));
  } else if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    response = NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url));
  } else if (isAuthRoute && isLoggedIn) {
    response = NextResponse.redirect(new URL('/', req.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)'],
};
