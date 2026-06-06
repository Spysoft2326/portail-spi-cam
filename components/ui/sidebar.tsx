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
  const role = user.role || "AGENT_SAISIE";

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
    ...(role === "SUPER_ADMIN"
      ? [
          {
            name: "Utilisateurs",
            href: "/parametres/users",
            icon: Users,
            roles: ["SUPER_ADMIN"],
          },
          {
            name: "Alertes",
            href: "/parametres/alertes",
            icon: AlertTriangle,
            roles: ["SUPER_ADMIN"],
          },
          {
            name: "Paramètres",
            href: "/parametres",
            icon: Settings,
            roles: ["SUPER_ADMIN"],
          },
        ]
      : []),
  ];

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a1a2e] text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#007A3D] rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Portail SPI Cam</h2>
            <p className="text-xs text-white/50">Espace professionnel</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#007A3D]/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-[#007A3D]">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#007A3D]/20 rounded text-xs text-[#007A3D]">
              {role === "SUPER_ADMIN" && "Super-Admin"}
              {role === "ADMIN" && "Administrateur"}
              {role === "AGENT_SAISIE" && "Agent de saisie"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-[#007A3D] text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
