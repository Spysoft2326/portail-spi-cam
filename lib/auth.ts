import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validated = credentialsSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email: validated.email },
          });

          // Utilisateur inconnu ou sans mot de passe : refus (même message, sans dire lequel)
          if (!user || !user.password) {
            return null;
          }

          // Vérification du mot de passe haché (bcrypt)
          const passwordOk = await bcrypt.compare(validated.password, user.password);
          if (!passwordOk) {
            return null;
          }

          // Retourner l'utilisateur avec le role
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
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
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export function requireAuth(user: any) {
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function isAdmin(user: any) {
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

export function isSuperAdmin(user: any) {
  return user?.role === "SUPER_ADMIN";
}
