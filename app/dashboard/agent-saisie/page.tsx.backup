import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Building2, ClipboardList, ArrowRight } from "lucide-react";

export default async function AgentSaisieDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord — Agent de saisie</h1>
          <p className="text-slate-500 mt-1">Bienvenue, {session.user.name || session.user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/entreprises" className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Entreprises</h2>
            </div>
            <p className="text-sm text-slate-500">Consulter et gerer les entreprises repertoriees</p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Acceder <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>

          <Link href="/production" className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-slate-900">Production</h2>
            </div>
            <p className="text-sm text-slate-500">Saisir et consulter les donnees de production</p>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              Acceder <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
