import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { aAuMoins, type Role } from "@/lib/rbac";

// Rôle MINIMUM exigé par zone. « Qui peut le plus peut le moins » : un rôle supérieur
// accède à toutes les zones des rôles inférieurs (voir lib/rbac.ts).
// La première règle dont le préfixe correspond s'applique.
const ZONES: { prefixe: string; minimum: Role }[] = [
  { prefixe: "/dashboard/super-admin", minimum: "SUPER_ADMIN" },
  { prefixe: "/dashboard/parametres/users", minimum: "ADMIN" },
  { prefixe: "/dashboard/admin", minimum: "ADMIN" },
  { prefixe: "/dashboard/analytics", minimum: "ADMIN" },
  { prefixe: "/dashboard/alertes", minimum: "ADMIN" },
  { prefixe: "/dashboard/conjoncture", minimum: "ADMIN" },
  { prefixe: "/parametres", minimum: "ADMIN" },
  { prefixe: "/entreprises/manage", minimum: "ADMIN" },
  { prefixe: "/dashboard", minimum: "AGENT_SAISIE" },
  { prefixe: "/production", minimum: "AGENT_SAISIE" },
  { prefixe: "/alertes", minimum: "AGENT_SAISIE" },
];

/** Page d'accueil de l'espace connecté selon le rôle. */
function accueil(role: string): string {
  if (role === "SUPER_ADMIN") return "/dashboard/super-admin";
  if (role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/agent-saisie";
}

const PAGE_MOT_DE_PASSE = "/dashboard/parametres";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Les routes API vérifient elles-mêmes la session (réponse JSON 401/403).
  if (path.startsWith("/api/")) return NextResponse.next();

  // Routes publiques ("/" en correspondance exacte uniquement)
  const correspond = (p: string) => path === p || path.startsWith(p + "/");
  const publique =
    path === "/" ||
    (["/login", "/entreprises", "/conjoncture", "/about", "/contact"].some(correspond) && !correspond("/entreprises/manage"));
  if (publique) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // Session absente ou invalidée (compte supprimé / désactivé) -> connexion
  if (!token || !token.id || !token.role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }
  const role = token.role as string;

  // Mot de passe par défaut : changement obligatoire avant toute autre page
  if (token.doitChangerMotDePasse && path !== PAGE_MOT_DE_PASSE) {
    const url = new URL(PAGE_MOT_DE_PASSE, req.url);
    url.searchParams.set("tab", "mon-compte");
    url.searchParams.set("changer", "1");
    return NextResponse.redirect(url);
  }

  const zone = ZONES.find((z) => correspond(z.prefixe));
  if (zone && !aAuMoins(role, zone.minimum)) {
    return NextResponse.redirect(new URL(accueil(role), req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
