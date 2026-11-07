import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import UsersContent from "@/components/parametres/users-content";

// Gestion des comptes : données chargées via l'API protégée /api/admin/users (droits selon lib/rbac.ts).
// L'accès à /parametres est réservé aux administrateurs par le middleware.
export default function UsersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard/parametres" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux paramètres
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          </div>
        </div>
        <UsersContent />
      </div>
    </div>
  );
}
