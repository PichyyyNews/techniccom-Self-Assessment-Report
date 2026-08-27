import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // 1. Guard /admin/* paths: Only ROOT allowed
    if (pathname.startsWith("/admin")) {
      const isRoot = token?.role === "ROOT";

      if (!isRoot) {
        // Non-root trying to access /admin -> redirect to /dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname.startsWith("/api/health") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Protected routes: /admin, /dashboard
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
