"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalEntreprises: number;
  parSecteur: { name: string; count: number }[];
  parRegion: { name: string; count: number }[];
  parVille: { name: string; count: number }[];
  parStatut: { name: string; count: number }[];
  recentes: number;
  avecProduction: number;
  avecDocuments: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"secteur" | "region" | "ville" | "statut">("secteur");

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ["Secteur", "Nombre"],
      ...stats.parSecteur.map((s) => [s.name, s.count.toString()]),
      [],
      ["Région", "Nombre"],
      ...stats.parRegion.map((r) => [r.name, r.count.toString()]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stats-spi-cam-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getChartData = () => {
    if (!stats) return [];
    switch (activeTab) {
      case "secteur": return stats.parSecteur;
      case "region": return stats.parRegion;
      case "ville": return stats.parVille;
      case "statut": return stats.parStatut;
      default: return [];
    }
  };

  const maxCount = Math.max(...getChartData().map((d) => d.count), 1);

  const colors = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
    "bg-orange-500", "bg-cyan-500", "bg-lime-500", "bg-rose-500",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error || "Erreur de chargement"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de bord Super-Admin</h1>
              <p className="text-blue-200 mt-1">Portail SPI-CAM — Vue d'ensemble</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportCSV}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                📊 Exporter CSV
              </button>
              <Link
                href="/entreprises"
                className="bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                🌐 Voir l'annuaire public
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Total entreprises"
            value={stats.totalEntreprises}
            icon="🏢"
            color="bg-blue-500"
          />
          <KpiCard
            title="Nouvelles (30j)"
            value={stats.recentes}
            icon="🆕"
            color="bg-green-500"
          />
          <KpiCard
            title="Avec production"
            value={stats.avecProduction}
            icon="📈"
            color="bg-yellow-500"
          />
          <KpiCard
            title="Avec documents"
            value={stats.avecDocuments}
            icon="📄"
            color="bg-purple-500"
          />
        </div>

        {/* Graphiques */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">📊 Répartition des entreprises</h2>
            <div className="flex gap-2">
              {(["secteur", "region", "ville", "statut"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab === "secteur" && "Par secteur"}
                  {tab === "region" && "Par région"}
                  {tab === "ville" && "Par ville"}
                  {tab === "statut" && "Par statut"}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-3">
            {getChartData().map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600 truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium px-3 leading-8">
                      {item.count}
                    </span>
                  </div>
                </div>
                <div className="w-12 text-right text-sm text-gray-500">
                  {((item.count / stats.totalEntreprises) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tableaux détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top secteurs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏭 Top secteurs</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Secteur</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">Entreprises</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">%</th>
                </tr>
              </thead>
              <tbody>
                {stats.parSecteur.slice(0, 10).map((s) => (
                  <tr key={s.name} className="border-b last:border-0">
                    <td className="py-2 text-sm">{s.name}</td>
                    <td className="py-2 text-sm text-right font-medium">{s.count}</td>
                    <td className="py-2 text-sm text-right text-gray-500">
                      {((s.count / stats.totalEntreprises) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top régions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Top régions</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Région</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">Entreprises</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">%</th>
                </tr>
              </thead>
              <tbody>
                {stats.parRegion.map((r) => (
                  <tr key={r.name} className="border-b last:border-0">
                    <td className="py-2 text-sm">{r.name}</td>
                    <td className="py-2 text-sm text-right font-medium">{r.count}</td>
                    <td className="py-2 text-sm text-right text-gray-500">
                      {((r.count / stats.totalEntreprises) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
