import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Routes publiques — pas de vérification
    if (path.startsWith("/api/public") || path === "/" || path.startsWith("/entreprises") || path.startsWith("/notes-conjoncture") || path.startsWith("/conjoncture")) {
      return NextResponse.next();
    }

    // Routes Super-Admin uniquement
    if (path.startsWith("/dashboard/super-admin")) {
      if (token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      }
    }

    // Routes Admin et Super-Admin
    if (path.startsWith("/dashboard/admin") || path.startsWith("/parametres") || path.startsWith("/entreprises/manage") || path.startsWith("/conjoncture/write")) {
      if (!["ADMIN", "SUPER_ADMIN"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard/agent", req.url));
      }
    }

    // Routes Agent et plus
    if (path.startsWith("/dashboard/agent") || path.startsWith("/production")) {
      if (!["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Routes publiques autorisées sans token
        const publicPaths = ["/", "/entreprises", "/conjoncture", "/notes-conjoncture", "/api/public"];
        const isPublic = publicPaths.some(p => req.nextUrl.pathname.startsWith(p));
        if (isPublic) return true;

        return token !== null;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/production/:path*",
    "/conjoncture/:path*",
    "/entreprises/manage/:path*",
    "/parametres/:path*",
    "/api/entreprises/:path*",
    "/api/production/:path*",
    "/api/conjoncture/:path*",
    "/api/export/:path*",
  ],
};
