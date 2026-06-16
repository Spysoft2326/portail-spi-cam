import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import { Shield, ArrowLeft } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role || "AGENT_SAISIE";

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        {/* Header harmonisé */}
        <div className="bg-white border-b px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {/* CORRECTION: Lien vers Paramètres au lieu de la page publique */}
            <Link
              href="/dashboard/parametres"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux paramètres
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#007A3D] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {role === "SUPER_ADMIN" ? "Tableau de bord SuperAdmin" :
                     role === "ADMIN" ? "Tableau de bord Admin" :
                     role === "AGENT_SAISIE" ? "Espace Agent" : "Portail SPI-CAM"}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Gestion du portail SPI-CAM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-[#007A3D]/10 text-[#007A3D] rounded-full text-sm font-medium uppercase">
                  {role.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
