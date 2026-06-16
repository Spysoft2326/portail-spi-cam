import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UsersContent from "@/components/parametres/users-content";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  // Récupérer les utilisateurs depuis la base de données
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      // ❌ REMOVED: isActive n'existe pas dans le modèle Prisma User
      emailVerified: true,
    },
    orderBy: { id: "desc" },
  });

  return <UsersContent users={users} />;
}
