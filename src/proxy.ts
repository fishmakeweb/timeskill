import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PATHS = [
  "/dashboard",
  "/habits",
  "/tasks",
  "/courses",
  "/calendar",
  "/focus",
  "/settings",
  "/notes",
  "/sleep",
  "/water",
];

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to signin
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/habits/:path*",
    "/tasks/:path*",
    "/courses/:path*",
    "/calendar/:path*",
    "/focus/:path*",
    "/settings/:path*",
    "/notes/:path*",
    "/sleep/:path*",
    "/water/:path*",
    "/auth/:path*",
  ],
};
