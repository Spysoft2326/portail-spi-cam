import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { estRole } from "./rbac";

/** Après MAX_ECHECS échecs consécutifs, le compte est bloqué DUREE_BLOCAGE_MIN minutes. */
const MAX_ECHECS = 5;
const DUREE_BLOCAGE_MIN = 15;

/** Recherche un compte par identifiant (ex. "Spysoft") ou par email, sans tenir compte de la casse. */
export async function trouverCompte(saisie: string) {
  const cle = saisie.trim().toLowerCase();
  if (!cle) return null;
  return prisma.user.findFirst({ where: { OR: [{ identifiant: cle }, { email: cle }] } });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifiant: { label: "Identifiant ou email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // "email" reste accepté pour compatibilité avec d'anciens formulaires
        const saisie = String((credentials as any)?.identifiant || (credentials as any)?.email || "");
        const motDePasse = String(credentials?.password || "");
        if (!saisie || !motDePasse || motDePasse.length > 200) return null;

        const user = await trouverCompte(saisie);
        // Même réponse dans tous les cas d'échec : on ne révèle pas si le compte existe
        if (!user || !user.password || !user.actif) return null;
        if (user.bloqueJusqua && user.bloqueJusqua > new Date()) return null;

        const ok = await bcrypt.compare(motDePasse, user.password);
        if (!ok) {
          const echecs = user.tentativesEchouees + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: echecs >= MAX_ECHECS
              ? { tentativesEchouees: 0, bloqueJusqua: new Date(Date.now() + DUREE_BLOCAGE_MIN * 60_000) }
              : { tentativesEchouees: echecs },
          });
          if (echecs >= MAX_ECHECS) {
            await prisma.auditLog.create({ data: { action: "COMPTE_BLOQUE", entity: "User", entityId: user.id, userId: user.id, details: `${MAX_ECHECS} échecs de connexion` } }).catch(() => {});
          }
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { tentativesEchouees: 0, bloqueJusqua: null, derniereConnexion: new Date() },
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          doitChangerMotDePasse: user.doitChangerMotDePasse,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.doitChangerMotDePasse = (user as any).doitChangerMotDePasse;
        return token;
      }
      // À chaque utilisation de la session : on relit le compte pour appliquer immédiatement
      // une désactivation, une suppression ou un changement de rôle.
      if (token.id) {
        const compte = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, actif: true, name: true, email: true, doitChangerMotDePasse: true },
        });
        if (!compte || !compte.actif || !estRole(compte.role)) {
          return { invalide: true } as any; // session invalidée : plus d'id ni de rôle
        }
        token.role = compte.role;
        token.name = compte.name;
        token.email = compte.email;
        token.doitChangerMotDePasse = compte.doitChangerMotDePasse;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        // Session invalidée : aucun droit
        return { ...session, user: undefined as any };
      }
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? null;
        (session.user as any).doitChangerMotDePasse = !!token.doitChangerMotDePasse;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // une journée de travail
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
