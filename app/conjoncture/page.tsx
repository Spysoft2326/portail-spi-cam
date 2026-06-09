"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Activity, BarChart3, ArrowLeft, Calendar, Filter } from "lucide-react";

interface Indicateur {
  id: string;
  nom: string;
  valeur: number;
  unite: string;
  variation: number; // %
  periode: string;
  secteur: string;
}

export default function ConjoncturePage() {
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSecteur, setSelectedSecteur] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("");

  const secteurs = ["Tous", "Agriculture", "Industrie", "Services", "Mines", "Energie"];
  const periodes = ["Toutes", "T1 2026", "T4 2025", "T3 2025", "T2 2025"];

  useEffect(() => {
    fetchIndicateurs();
  }, [selectedSecteur, selectedPeriode]);

  const fetchIndicateurs = async () => {
    setLoading(true);
    setError("");
    try {
      // Données de démonstration — à remplacer par un appel API réel
      const data: Indicateur[] = [
        { id: "1", nom: "Production industrielle", valeur: 125.4, unite: "Index", variation: 3.2, periode: "T1 2026", secteur: "Industrie" },
        { id: "2", nom: "Chiffre d'affaires moyen", valeur: 850, unite: "M FCFA", variation: -1.5, periode: "T1 2026", secteur: "Services" },
        { id: "3", nom: "Exportations agricoles", valeur: 45.2, unite: "M tonnes", variation: 8.7, periode: "T1 2026", secteur: "Agriculture" },
        { id: "4", nom: "Prix du cacao", valeur: 2850, unite: "USD/tonne", variation: 12.3, periode: "T1 2026", secteur: "Agriculture" },
        { id: "5", nom: "Production pétrolière", valeur: 32000, unite: "barils/j", variation: -2.1, periode: "T1 2026", secteur: "Energie" },
        { id: "6", nom: "Investissements miniers", valeur: 1250, unite: "M FCFA", variation: 5.4, periode: "T1 2026", secteur: "Mines" },
        { id: "7", nom: "Emploi industriel", valeur: 48500, unite: "salariés", variation: 1.8, periode: "T1 2026", secteur: "Industrie" },
        { id: "8", nom: "Capacité de production", valeur: 78.5, unite: "%", variation: 2.3, periode: "T1 2026", secteur: "Industrie" },
      ];

      let filtered = data;
      if (selectedSecteur && selectedSecteur !== "Tous") {
        filtered = filtered.filter(i => i.secteur === selectedSecteur);
      }
      if (selectedPeriode && selectedPeriode !== "Toutes") {
        filtered = filtered.filter(i => i.periode === selectedPeriode);
      }

      setIndicateurs(filtered);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVariationColor = (variation: number) => {
    if (variation > 0) return "text-green-600 bg-green-50";
    if (variation < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="w-4 h-4" />;
    if (variation < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/dashboard/super-admin" className="text-blue-200 hover:text-white transition">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold">Conjoncture économique</h1>
              </div>
              <p className="text-blue-200 text-lg">
                Indicateurs et tendances du secteur industriel camerounais
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/super-admin"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
              >
                Tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filtres :</span>
            </div>
            <select
              value={selectedSecteur}
              onChange={(e) => setSelectedSecteur(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {secteurs.map(s => <option key={s} value={s === "Tous" ? "" : s}>{s}</option>)}
            </select>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {periodes.map(p => <option key={p} value={p === "Toutes" ? "" : p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Indicateurs actifs</span>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{indicateurs.length}</div>
            <div className="text-sm text-gray-500 mt-1">Sur {periodes.length - 1} périodes</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Tendance positive</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {indicateurs.filter(i => i.variation > 0).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Indicateurs en hausse</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Tendance négative</span>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              {indicateurs.filter(i => i.variation < 0).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Indicateurs en baisse</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Dernière mise à jour</span>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">T1 2026</div>
            <div className="text-sm text-gray-500 mt-1">Trimestre en cours</div>
          </div>
        </div>

        {/* Tableau des indicateurs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des indicateurs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Indicateurs détaillés</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secteur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {indicateurs.map((ind) => (
                    <tr key={ind.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{ind.nom}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ind.secteur}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{ind.periode}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {ind.valeur.toLocaleString()} <span className="text-gray-500 text-sm">{ind.unite}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getVariationColor(ind.variation)}`}>
                          {getVariationIcon(ind.variation)}
                          {ind.variation > 0 ? "+" : ""}{ind.variation}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>2026 Portail SPI-CAM - Ministère de l'Industrie du Cameroun</p>
            <div className="flex gap-4">
              <Link href="/dashboard/super-admin" className="hover:text-blue-600 transition">Tableau de bord</Link>
              <Link href="/entreprises" className="hover:text-blue-600 transition">Annuaire</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
