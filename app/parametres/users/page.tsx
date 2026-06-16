import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import UsersContent from "@/components/parametres/users-content";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard/admin");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      // ❌ REMOVED: isActive n'existe pas dans le modèle Prisma User
      createdAt: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/parametres"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux paramètres
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
                <p className="text-slate-500">{users.length} utilisateur(s) enregistré(s)</p>
              </div>
            </div>
          </div>
        </div>

        <UsersContent users={users} />
      </div>
    </div>
  );
}
