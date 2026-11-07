import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Vérifie la session (et éventuellement le rôle) dans une route API.
 * Renvoie { session } si autorisé, sinon { error } : une réponse 401/403 à retourner telle quelle.
 *
 *   const auth = await requireApiRole(["SUPER_ADMIN"]);
 *   if (auth.error) return auth.error;
 */
export async function requireApiRole(roles?: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  if (roles && !roles.includes(session.user.role as string)) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }) };
  }
  return { session };
}

/**
 * Routes de seed (création/suppression massive de données) :
 * désactivées sauf si ALLOW_SEED_ROUTES=true ET appel par un SUPER_ADMIN.
 */
export async function requireSeedAccess() {
  if (process.env.ALLOW_SEED_ROUTES !== "true") {
    return { error: NextResponse.json({ error: "Route désactivée" }, { status: 404 }) };
  }
  return requireApiRole(["SUPER_ADMIN"]);
}
