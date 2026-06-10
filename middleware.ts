import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // Routes publiques — toujours autoriser
  const publicPaths = ["/", "/login", "/register", "/api/auth", "/entreprises", "/about", "/contact"];
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Si non authentifié — rediriger vers login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Routes Super-Admin uniquement
  if (path.startsWith("/dashboard/super-admin")) {
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
  }

  // Routes Admin et Super-Admin (incluant /parametres et /conjoncture)
  if (
    path.startsWith("/dashboard/admin") ||
    path.startsWith("/parametres") ||
    path.startsWith("/entreprises/manage") ||
    path.startsWith("/conjoncture")
  ) {
    if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard/agent-saisie", req.url));
    }
  }

  // Routes Agent et plus (dashboard/agent-saisie et production)
  if (path.startsWith("/dashboard/agent-saisie") || path.startsWith("/production")) {
    if (!["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Si l'utilisateur arrive sur /dashboard sans suffixe, rediriger selon le rôle
  if (path === "/dashboard") {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/super-admin", req.url));
    } else if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/agent-saisie", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
