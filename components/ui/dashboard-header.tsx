"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Shield } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  showBackLink?: boolean;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  icon,
  showBackLink = true,
  backHref = "/",
  backLabel = "Retour au site",
  children,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const role = session?.user?.role || "";

  return (
    <div className="bg-white border-b px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {showBackLink && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#007A3D] rounded-xl flex items-center justify-center">
              {icon || <Shield className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {role && (
              <span className="px-3 py-1 bg-[#007A3D]/10 text-[#007A3D] rounded-full text-sm font-medium">
                {role}
              </span>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
