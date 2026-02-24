import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use next-auth v5's built-in middleware — supports trustHost for Vercel
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/habits/:path*",
    "/tasks/:path*",
    "/courses/:path*",
    "/notes/:path*",
    "/calendar/:path*",
    "/focus/:path*",
    "/water/:path*",
    "/sleep/:path*",
    "/settings/:path*",
  ],
};
