import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no Node.js imports like mongoose/bcrypt)
// Used by proxy.ts (edge middleware) for route protection
export const authConfig = {
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const protectedPaths = [
        "/dashboard",
        "/habits",
        "/tasks",
        "/courses",
        "/notes",
        "/calendar",
        "/focus",
        "/water",
        "/sleep",
        "/settings",
        "/health",
      ];

      const isProtected = protectedPaths.some((path) =>
        pathname.startsWith(path),
      );

      if (isProtected) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Providers added in lib/auth.ts (Node.js runtime only)
  trustHost: true,
} satisfies NextAuthConfig;
