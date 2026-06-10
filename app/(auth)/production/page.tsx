"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import ProductionContent from "@/components/production/production-content";

export default function ProductionPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "";
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#007A3D] rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Productions</h1>
                <p className="text-gray-500">
                  Saisies trimestrielles {isAdmin ? "- Toutes les données" : "- Mes saisies"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {role && (
                <span className="px-3 py-1 bg-[#007A3D]/10 text-[#007A3D] rounded-full text-sm font-medium">
                  {role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <ProductionContent />
      </div>
    </div>
  );
}
