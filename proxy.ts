import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that should NOT be rewritten to /soon
const isAllowedRoute = createRouteMatcher([
  '/soon',
  '/api(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Allow static files to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.') ||
    pathname.startsWith('/terms')
  ) {
    return NextResponse.next();
  }

  // If not an allowed route, rewrite to /soon
  if (!isAllowedRoute(request)) {
    return NextResponse.rewrite(new URL('/soon', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
