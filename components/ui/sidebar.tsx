PS C:\Users\mlipc\OneDrive\Bureau\portail-spi-cam\portail-spi-cam-phase5\portail-spi-cam> # Vérifier le layout du dashboard
PS C:\Users\mlipc\OneDrive\Bureau\portail-spi-cam\portail-spi-cam-phase5\portail-spi-cam> Get-Content -LiteralPath "app\dashboard\layout.tsx" -Head 30
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import { Shield, ArrowLeft } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role || "AGENT_SAISIE";

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        {/* Header harmonisÃ© */}
        <div className="bg-white border-b px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
PS C:\Users\mlipc\OneDrive\Bureau\portail-spi-cam\portail-spi-cam-phase5\portail-spi-cam>
PS C:\Users\mlipc\OneDrive\Bureau\portail-spi-cam\portail-spi-cam-phase5\portail-spi-cam> # Vérifier les deux sidebars
PS C:\Users\mlipc\OneDrive\Bureau\portail-spi-cam\portail-spi-cam-phase5\portail-spi-cam> Get-Content -LiteralPath "components\layout\sidebar.tsx" -Head 50
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
PS C:\Users\mlipc\OneDrive\Bureau\portail-spi-cam\portail-spi-cam-phase5\portail-spi-cam> Get-Content -LiteralPath "components\ui\sidebar.tsx" -Head 50
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
      href: "/dashboard/entreprises",
      icon: Building2,
      roles: ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"],
    },
    {
      name: "Production",
PS C:\Users\mlipc\OneDrive\Bureau\portail-spi-cam\portail-spi-cam-phase5\portail-spi-cam>