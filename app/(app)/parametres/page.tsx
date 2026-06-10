"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import ParametresContent from "@/components/parametres/parametres-content";

export default function ParametresPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "";

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
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres système</h1>
                <p className="text-gray-500">Configuration et administration du portail SPI-CAM</p>
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
        <ParametresContent />
      </div>
    </div>
  );
}
