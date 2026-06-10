"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  FileText,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const role = user?.role || "AGENT_SAISIE";

  const navigation = [
    ...(role !== "PUBLIC"
      ? [
          {
            name: "Tableau de bord",
            href: `/dashboard/${role.toLowerCase().replace("_", "-")}`,
            icon: LayoutDashboard,
            roles: ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"],
          },
        ]
      : []),
    {
      name: "Entreprises",
      href: "/entreprises",
      icon: Building2,
      roles: ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"],
    },
    {
      name: "Production",
      href: "/production",
      icon: ClipboardList,
      roles: ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"],
    },
    ...(role !== "AGENT_SAISIE"
      ? [
          {
            name: "Conjoncture",
            href: "/conjoncture",
            icon: FileText,
            roles: ["ADMIN", "SUPER_ADMIN"],
          },
          {
            name: "Analytics",
            href: "/dashboard/admin",
            icon: BarChart3,
            roles: ["ADMIN", "SUPER_ADMIN"],
          },
        ]
      : []),
    ...(role === "SUPER_ADMIN" || role === "ADMIN"
      ? [
          {
            name: "Utilisateurs",
            href: "/parametres/users",
            icon: Users,
            roles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            name: "Alertes",
            href: "/parametres/alertes",
            icon: AlertTriangle,
            roles: ["SUPER_ADMIN", "ADMIN"],
          },
        ]
      : []),
    {
      name: "Paramètres",
      href: "/parametres",
      icon: Settings,
      roles: ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold">Portail SPI-Cam</h2>
        <p className="text-xs text-slate-400 mt-1">
          {user?.name || "Utilisateur"}
        </p>
        <p className="text-xs text-slate-500 capitalize">
          {role.replace("_", " ").toLowerCase()}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}