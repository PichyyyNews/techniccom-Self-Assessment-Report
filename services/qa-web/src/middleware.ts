import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    const isRoot = token?.role === "ROOT";
    const userPermissions = (token?.permissions as string[]) || ["/dashboard"];

    // 1. Guard /admin/* paths: ROOT or roles with permission for /admin/users
    if (pathname.startsWith("/admin")) {
      const canAccessAdmin = isRoot || userPermissions.some((p) => pathname.startsWith(p));
      if (!canAccessAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 2. Guard /dashboard/* paths
    if (pathname.startsWith("/dashboard")) {
      const canAccessDashboard = isRoot || userPermissions.includes("/dashboard");
      if (!canAccessDashboard) {
        // If they only have admin permission
        if (userPermissions.includes("/admin/users")) {
          return NextResponse.redirect(new URL("/admin/users", req.url));
        }
        return NextResponse.redirect(new URL("/login", req.url));
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
    "/profile/:path*",
  ],
};
