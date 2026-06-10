import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
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

          if (!user) {
            console.error("User not found:", validated.email);
            return null;
          }

          if (!user.isActive) {
            console.error("User inactive:", validated.email);
            return null;
          }

          // Verifier que le mot de passe existe
          if (!user.password) {
            console.error("No password set for:", validated.email);
            return null;
          }

          // Verifier le mot de passe avec bcrypt
          const isPasswordValid = await bcrypt.compare(validated.password, user.password);

          if (!isPasswordValid) {
            console.error("Invalid password for:", validated.email);
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
