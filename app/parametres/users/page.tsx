import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Users, Shield, UserCheck, Search } from "lucide-react";

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
      isActive: true,
      createdAt: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const roleLabels: Record<string, string> = {
    AGENT_SAISIE: "Agent de saisie",
    ADMIN: "Administrateur",
    SUPER_ADMIN: "Super Administrateur",
  };

  const roleColors: Record<string, string> = {
    AGENT_SAISIE: "bg-blue-100 text-blue-800",
    ADMIN: "bg-green-100 text-green-800",
    SUPER_ADMIN: "bg-purple-100 text-purple-800",
  };

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

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Agents de saisie</p>
                <p className="text-xl font-bold text-slate-900">
                  {users.filter((u) => u.role === "AGENT_SAISIE").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-500">Administrateurs</p>
                <p className="text-xl font-bold text-slate-900">
                  {users.filter((u) => u.role === "ADMIN").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">Super Admins</p>
                <p className="text-xl font-bold text-slate-900">
                  {users.filter((u) => u.role === "SUPER_ADMIN").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="flex-1 outline-none text-sm"
              readOnly
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Inscription</th>
                  <th className="px-4 py-3">Email vérifié</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{user.name || "—"}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || "bg-gray-100 text-gray-800"}`}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {user.emailVerified ? (
                        <span className="text-green-600 text-xs">✓ Oui</span>
                      ) : (
                        <span className="text-amber-600 text-xs">✗ Non</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}