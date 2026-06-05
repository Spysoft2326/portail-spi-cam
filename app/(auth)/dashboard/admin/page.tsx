"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  ClipboardCheck,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("T1 2026");

  const stats = [
    {
      title: "Entreprises actives",
      value: "87",
      change: "+5",
      trend: "up",
      icon: Building2,
      color: "bg-[#007A3D]",
    },
    {
      title: "Données en attente",
      value: "23",
      change: "+12",
      trend: "up",
      icon: Clock,
      color: "bg-[#FCD116] text-black",
    },
    {
      title: "Données validées",
      value: "156",
      change: "+28",
      trend: "up",
      icon: CheckCircle2,
      color: "bg-emerald-600",
    },
    {
      title: "Alertes actives",
      value: "7",
      change: "-2",
      trend: "down",
      icon: AlertTriangle,
      color: "bg-[#CE1126]",
    },
  ];

  const validationQueue = [
    { id: 1, agent: "Agent Douala", entreprise: "SABC", periode: "T1 2026", date: "03/06/2026", type: "Production" },
    { id: 2, agent: "Agent Yaoundé", entreprise: "Alucam", periode: "T1 2026", date: "03/06/2026", type: "Production" },
    { id: 3, agent: "Agent Douala", entreprise: "Cimencam", periode: "T1 2026", date: "02/06/2026", type: "Production" },
    { id: 4, agent: "Agent Yaoundé", entreprise: "COTCO", periode: "S1 2026", date: "02/06/2026", type: "Production" },
    { id: 5, agent: "Agent Douala", entreprise: "Tractafric", periode: "T1 2026", date: "01/06/2026", type: "Production" },
  ];

  const sectorPerformance = [
    { secteur: "Agroalimentaire", volume: 45000, croissance: 8.5, color: "bg-[#007A3D]" },
    { secteur: "Mines", volume: 32000, croissance: 12.3, color: "bg-[#CE1126]" },
    { secteur: "Métallurgie", volume: 28000, croissance: -2.1, color: "bg-blue-600" },
    { secteur: "BTP", volume: 21000, croissance: 5.7, color: "bg-[#FCD116]" },
    { secteur: "Énergie", volume: 18000, croissance: 15.2, color: "bg-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord Administrateur</h2>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble et validation des données</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007A3D] outline-none"
        >
          <option>T1 2026</option>
          <option>S1 2026</option>
          <option>2025</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === "up" ? "text-emerald-600" : "text-red-600"
              }`}>
                {stat.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validation Queue */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#007A3D]" />
              <h3 className="font-semibold text-gray-900">File d'attente validation</h3>
            </div>
            <span className="px-2 py-1 bg-[#FCD116]/20 text-[#FCD116] text-xs rounded-full font-medium">
              {validationQueue.length} en attente
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {validationQueue.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.entreprise}</p>
                  <p className="text-xs text-gray-500">{item.agent} • {item.periode} • {item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/production/validate/${item.id}`}
                    className="px-3 py-1.5 bg-[#007A3D] text-white text-xs rounded-lg hover:bg-[#006633] transition-colors"
                  >
                    Valider
                  </Link>
                  <button className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <Link
              href="/production"
              className="text-sm text-[#007A3D] hover:text-[#006633] font-medium"
            >
              Voir toutes les validations →
            </Link>
          </div>
        </div>

        {/* Sector Performance */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#007A3D]" />
              <h3 className="font-semibold text-gray-900">Performance par secteur</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {sectorPerformance.map((sector) => (
              <div key={sector.secteur}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{sector.secteur}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{sector.volume.toLocaleString()} t</span>
                    <span className={`text-xs font-medium ${
                      sector.croissance >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {sector.croissance >= 0 ? "+" : ""}{sector.croissance}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${sector.color}`}
                    style={{ width: `${(sector.volume / 50000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Admin */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Actions administrateur</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/production" className="p-4 bg-[#007A3D]/5 rounded-lg hover:bg-[#007A3D]/10 transition-colors">
            <ClipboardCheck className="w-5 h-5 text-[#007A3D] mb-2" />
            <p className="text-sm font-medium">Valider données</p>
          </Link>
          <Link href="/conjoncture" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <FileText className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-sm font-medium">Notes conjoncture</p>
          </Link>
          <Link href="/entreprises" className="p-4 bg-[#FCD116]/10 rounded-lg hover:bg-[#FCD116]/20 transition-colors">
            <Building2 className="w-5 h-5 text-[#FCD116] mb-2" />
            <p className="text-sm font-medium">Gérer entreprises</p>
          </Link>
          <Link href="/parametres" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Users className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-sm font-medium">Utilisateurs</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
