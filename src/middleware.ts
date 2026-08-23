import { NextRequest, NextResponse } from "next/server";

// Kept as a literal (not imported from lib/session) so this middleware stays
// dependency-free and edge-runtime safe. The actual session validation
// against the database happens in requireUser() on the server — this is
// just a fast redirect for the common case of no cookie at all.
const SESSION_COOKIE_NAME = "session";

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!isPublic && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
