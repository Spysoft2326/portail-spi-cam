import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export { authOptions };
export { getServerSession };

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
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

