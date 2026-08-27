import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // 1. Guard /admin/* paths: Only SUPER_ADMIN and QA_HEAD allowed
    if (pathname.startsWith("/admin")) {
      const role = token?.role;
      const isAdmin = role === "SUPER_ADMIN" || role === "QA_HEAD";

      if (!isAdmin) {
        // Non-admin trying to access /admin -> redirect to /dashboard
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

        // Protected routes: /admin, /dashboard, /indicators, /evidence
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
    "/indicators/:path*",
    "/evidence/:path*",
  ],
};
