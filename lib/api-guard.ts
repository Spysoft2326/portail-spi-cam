import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { aAuMoins, type Role } from "@/lib/rbac";

type Session = NonNullable<Awaited<ReturnType<typeof getServerSession<typeof authOptions>>>>;

/**
 * Vérifie la session (et éventuellement le rôle) dans une route API.
 * Renvoie { session } si autorisé, sinon { error } : une réponse 401/403 à retourner telle quelle.
 *
 *   const auth = await requireApiRole(["SUPER_ADMIN"]);
 *   if (auth.error) return auth.error;
 *
 * Une session dont le mot de passe par défaut n'a pas été changé n'a accès qu'au changement
 * de mot de passe (option autoriserMotDePasseParDefaut).
 */
export async function requireApiRole(roles?: string[], options: { autoriserMotDePasseParDefaut?: boolean } = {}) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  if (session.user.doitChangerMotDePasse && !options.autoriserMotDePasseParDefaut) {
    return { error: NextResponse.json({ error: "Vous devez d'abord changer votre mot de passe" }, { status: 403 }) };
  }
  if (roles && !roles.includes(session.user.role as string)) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }) };
  }
  return { session };
}

/** Variante hiérarchique : « qui peut le plus peut le moins » (rôle minimum exigé). */
export async function requireApiNiveau(minimum: Role, options: { autoriserMotDePasseParDefaut?: boolean } = {}) {
  const auth = await requireApiRole(undefined, options);
  if (auth.error) return auth;
  if (!aAuMoins(auth.session.user.role, minimum)) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }) };
  }
  return auth;
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
