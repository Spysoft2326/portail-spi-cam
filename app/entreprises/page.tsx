"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import EntreprisesContent from "@/components/entreprises/entreprises-content";

export default function EntreprisesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Lien retour accueil */}
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour a l accueil
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Annuaire des entreprises</h1>
              </div>
              <p className="text-gray-500">
                Entreprises repertoriees dans le portail SPI-CAM
              </p>
            </div>
          </div>
          {role && (
            <span className="px-3 py-1 bg-[#007A3D]/10 text-[#007A3D] rounded-full text-sm font-medium">
              {role}
            </span>
          )}
        </div>
      </div>

      <div className="p-8">
        <EntreprisesContent />
      </div>
    </div>
  );
}
