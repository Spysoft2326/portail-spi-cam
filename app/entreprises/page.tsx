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
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Annuaire des entreprises</h1>
            </div>
            <p className="text-gray-500">
              Entreprises répertoriées dans le portail SPI-CAM
            </p>
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
