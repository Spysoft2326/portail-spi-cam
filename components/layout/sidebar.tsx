"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Factory,
  Settings,
  LogOut,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userRole = "SUPER_ADMIN", userName = "Super Administrateur", userEmail = "superadmin@spi-cam.cm" }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard/super-admin" && pathname === "/dashboard/super-admin") return true;
    if (path === "/dashboard/agent" && pathname === "/dashboard/agent") return true;
    if (path !== "/dashboard/super-admin" && path !== "/dashboard/agent" && pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    { path: "/dashboard/super-admin", label: "Tableau de bord", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN"] },
    { path: "/entreprises", label: "Entreprises", icon: Building2, roles: ["SUPER_ADMIN", "ADMIN", "AGENT_SAISIE"] },
    { path: "/production", label: "Production", icon: Factory, roles: ["SUPER_ADMIN", "ADMIN", "AGENT_SAISIE"] },
    { path: "/conjoncture", label: "Conjoncture", icon: TrendingUp, roles: ["SUPER_ADMIN", "ADMIN", "AGENT_SAISIE"] },
    { path: "/alertes", label: "Alertes", icon: AlertTriangle, roles: ["SUPER_ADMIN", "ADMIN"] },
    { path: "/parametres", label: "Parametres", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#007A3D] rounded-lg flex items-center justify-center">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Portail SPI Cam</h1>
            <p className="text-xs text-slate-400">Espace professionnel</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{userName?.charAt(0) || "U"}</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#007A3D]/20 text-[#007A3D] text-xs rounded-full">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-[#007A3D] text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Deconnexion</span>
        </Link>
      </div>
    </aside>
  );
}
