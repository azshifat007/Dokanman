import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret, SESSION_COOKIE_NAME } from "@/lib/auth-secret";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and API exclusions
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg")
  ) {
    return NextResponse.next();
  }

  let secret: Uint8Array;
  try {
    secret = getAuthSecret();
  } catch (error) {
    console.error("[auth] deployment is missing a usable AUTH_SECRET:", error);
    return new NextResponse("Server configuration error: AUTH_SECRET is not set.", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, secret, { algorithms: ["HS256"] });
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // If already authenticated and trying to access login/signup -> go to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If not authenticated and trying to access protected dashboard -> redirect to login
  if (!isAuthRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
