"use client";

import { useSession } from "next-auth/react";
import {
  ClipboardList,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function AgentDashboard() {
  const { data: session } = useSession();

  const stats = [
    {
      title: "Mes saisies",
      value: "12",
      subtitle: "T1 2026",
      icon: ClipboardList,
      color: "bg-[#007A3D]",
      href: "/production",
    },
    {
      title: "Entreprises assignées",
      value: "15",
      subtitle: "Actives",
      icon: Building2,
      color: "bg-blue-600",
      href: "/entreprises",
    },
    {
      title: "En attente validation",
      value: "3",
      subtitle: "Données",
      icon: Clock,
      color: "bg-[#FCD116] text-black",
      href: "/production",
    },
    {
      title: "Validées",
      value: "9",
      subtitle: "Ce mois",
      icon: CheckCircle2,
      color: "bg-emerald-600",
      href: "/production",
    },
  ];

  const recentActivity = [
    { action: "Saisie production", entreprise: "SABC", date: "03/06/2026", statut: "En attente" },
    { action: "Saisie production", entreprise: "Alucam", date: "02/06/2026", statut: "Validée" },
    { action: "Saisie production", entreprise: "Cimencam", date: "01/06/2026", statut: "Validée" },
    { action: "Modification", entreprise: "COTCO", date: "31/05/2026", statut: "Validée" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#007A3D] to-[#007A3D]/80 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Bonjour, {session?.user?.name || "Agent"}
        </h2>
        <p className="text-white/80">
          Bienvenue dans votre espace de saisie. Vous avez 3 données de production en attente de validation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#007A3D] hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-[#007A3D] transition-colors">
                Voir →
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm font-medium text-gray-600">{stat.title}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.subtitle}</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Activité récente</h3>
          <Link
            href="/production"
            className="text-sm text-[#007A3D] hover:text-[#006633]"
          >
            Voir tout →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.statut === "Validée" ? "bg-emerald-500" : "bg-[#FCD116]"
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.entreprise} • {activity.date}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.statut === "Validée"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}>
                {activity.statut}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/production/new"
            className="flex items-center gap-3 p-4 bg-[#007A3D]/5 rounded-lg hover:bg-[#007A3D]/10 transition-colors"
          >
            <ClipboardList className="w-5 h-5 text-[#007A3D]" />
            <div>
              <p className="text-sm font-medium text-gray-900">Nouvelle saisie</p>
              <p className="text-xs text-gray-500">Production trimestrielle</p>
            </div>
          </Link>
          <Link
            href="/entreprises"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Liste entreprises</p>
              <p className="text-xs text-gray-500">Consulter le répertoire</p>
            </div>
          </Link>
          <Link
            href="/production"
            className="flex items-center gap-3 p-4 bg-[#FCD116]/10 rounded-lg hover:bg-[#FCD116]/20 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-[#FCD116]" />
            <div>
              <p className="text-sm font-medium text-gray-900">Mes productions</p>
              <p className="text-xs text-gray-500">Historique et statut</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
