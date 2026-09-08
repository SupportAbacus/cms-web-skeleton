import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory / edge redirects cache
const KNOWN_REDIRECTS: Record<string, { destination: string; permanent: boolean }> = {};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Instant 301 / 302 Redirect Engine
  if (KNOWN_REDIRECTS[pathname]) {
    const { destination, permanent } = KNOWN_REDIRECTS[pathname];
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url, { status: permanent ? 301 : 302 });
  }

  // 2. Add Security & Performance Request Headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next (all Next.js internal routes and assets)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api|_next|favicon.ico).*)",
  ],
};
