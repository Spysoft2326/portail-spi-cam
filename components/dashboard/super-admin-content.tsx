"use client";

import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";

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
  champIndustriel?: number;
  nonCodees?: number;
}

export default function SuperAdminContent() {
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
      ["Filière", "Nombre"],
      ...stats.parSecteur.map((s) => [s.name, s.count.toString()]),
      [],
      ["Region", "Nombre"],
      ...stats.parRegion.map((r) => [r.name, r.count.toString()]),
    ];
    const csv = rows.map((r) => r.join(";")).join(String.fromCharCode(10));
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-600">{error || "Erreur de chargement"}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Boutons d'action */}
      <div className="flex gap-2 mb-4 justify-end">
        <button
          onClick={exportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-2"
        >
          📊 Exporter CSV
        </button>
        <Link
          href="/entreprises"
          className="bg-[#007A3D] hover:bg-[#006633] text-white px-3 py-1.5 text-sm rounded-lg transition"
        >
          🌐 Voir l'annuaire public
        </Link>
      </div>

      {/* Indicateurs */}
      <KpiGrid>
        <KpiCard label="Total entreprises" value={stats.totalEntreprises} icon="🏢" accent="bg-blue-100" />
        <KpiCard label="Nouvelles (30j)" value={stats.recentes} icon="🆕" accent="bg-green-100" />
        <KpiCard label="Avec déclarations" value={stats.avecProduction} icon="📈" accent="bg-yellow-100" />
        <KpiCard label="Activité non codée" value={stats.nonCodees ?? 0} sub="à classer" icon="🏷️" accent="bg-purple-100" />
      </KpiGrid>

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
                {tab === "secteur" && "Par filière"}
                {tab === "region" && "Par région"}
                {tab === "ville" && "Par ville"}
                {tab === "statut" && "Par statut"}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-2">
          {getChartData().map((item, index) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-32 text-sm text-gray-600 truncate" title={item.name}>
                {item.name}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                  title={`${item.count} entreprise${item.count > 1 ? "s" : ""}`}
                />
              </div>
              <div className="w-24 text-right text-sm text-gray-500 whitespace-nowrap">
                <span className="font-medium text-gray-800">{item.count}</span>
                <span className="mx-1 text-gray-300">·</span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏭 Top filières</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-gray-500">Filière</th>
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
  );
}
