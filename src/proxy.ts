import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Only allow these pages, everything else goes to /soon
  const allowedPages = ['/soon', '/terms', '/privacy', '/refund'];
  const isAllowed = allowedPages.some(page => pathname === page || pathname.startsWith(page + '/'));

  if (isAllowed) {
    return NextResponse.next();
  }

  // Rewrite everything else to /soon
  return NextResponse.rewrite(new URL('/soon', request.url));
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
