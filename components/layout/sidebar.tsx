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
    { path: "/parametres", label: "Parametres", icon: Settings, roles: ["SUPER_ADMIN"] },
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
            <div className="font-bold text-lg">Portail SPI Cam</div>
            <div className="text-xs text-slate-400">Espace professionnel</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{userName}</div>
            <div className="text-xs text-slate-400 truncate">{userEmail}</div>
          </div>
        </div>
        <div className="mt-2">
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            {userRole === "SUPER_ADMIN" ? "Super Admin" : userRole === "ADMIN" ? "Admin" : "Agent"}
          </span>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.path === "/alertes" && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Deconnexion</span>
        </Link>
      </div>
    </aside>
  );
}