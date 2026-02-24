import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
);

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
