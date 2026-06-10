"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Calendar,
  Filter,
  Download,
  ArrowLeft,
  Building2,
  BarChart3,
  PieChart,
  FileText,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

interface Production {
  id: string;
  annee: number;
  trimestre: number;
  productionPhysique: number;
  chiffreAffaires: number;
  effectifs: number;
  investissements: number;
  statut: string;
  entreprise: {
    denomination: string;
    secteurActivite: string;
  };
}

interface Stats {
  totalProductions: number;
  totalCA: number;
  totalEmplois: number;
  totalInvestissements: number;
  productionsParSecteur: { name: string; value: number }[];
  productionsParTrimestre: { name: string; productions: number; ca: number }[];
}

const COLORS = ['#007A3D', '#CE1126', '#FCD116', '#0066CC', '#FF6600', '#9933CC', '#00CC99', '#FF3366'];

export default function ConjoncturePage() {
  const { data: session } = useSession();
  const [productions, setProductions] = useState<Production[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedAnnee, setSelectedAnnee] = useState<string>("");
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>("");
  const [selectedSecteur, setSelectedSecteur] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [annees, setAnnees] = useState<number[]>([]);
  const [secteurs, setSecteurs] = useState<string[]>([]);

  const role = session?.user?.role || "";
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedAnnee) params.append("annee", selectedAnnee);
      if (selectedTrimestre) params.append("trimestre", selectedTrimestre);
      if (selectedSecteur) params.append("secteur", selectedSecteur);

      const res = await fetch(`/api/public/conjoncture?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      setProductions(data.productions || []);
      setStats(data.stats || null);
      setAnnees(data.annees || []);
      setSecteurs(data.secteurs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedAnnee, selectedTrimestre, selectedSecteur]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setSelectedAnnee("");
    setSelectedTrimestre("");
    setSelectedSecteur("");
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Note de Conjoncture - Portail SPI-CAM</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #007A3D; text-align: center; }
          .header { text-align: center; margin-bottom: 30px; }
          .kpi { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .kpi-value { font-size: 24px; font-weight: bold; color: #007A3D; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #007A3D; color: white; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Note de Conjoncture Industrielle</h1>
          <p>Portail SPI-CAM - Cameroun</p>
          <p>Annee: ${selectedAnnee || 'Toutes'} | Trimestre: ${selectedTrimestre || 'Tous'}</p>
        </div>

        <div style="text-align: center;">
          <div class="kpi">
            <div class="kpi-value">${stats?.totalProductions || 0}</div>
            <div>Productions</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${(stats?.totalCA || 0).toLocaleString()} FCFA</div>
            <div>Chiffre d'affaires</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${stats?.totalEmplois || 0}</div>
            <div>Emplois</div>
          </div>
        </div>

        <h2>Detail des productions</h2>
        <table>
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Secteur</th>
              <th>Annee</th>
              <th>Trimestre</th>
              <th>Production</th>
              <th>CA (FCFA)</th>
              <th>Effectifs</th>
            </tr>
          </thead>
          <tbody>
            ${productions.map(p => `
              <tr>
                <td>${p.entreprise.denomination}</td>
                <td>${p.entreprise.secteurActivite}</td>
                <td>${p.annee}</td>
                <td>T${p.trimestre}</td>
                <td>${p.productionPhysique.toLocaleString()}</td>
                <td>${p.chiffreAffaires.toLocaleString()}</td>
                <td>${p.effectifs}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Document genere le ${new Date().toLocaleDateString('fr-FR')} - Portail SPI-CAM</p>
          <p>Ministere des Mines, de l'Industrie et du Developpement Technologique</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header harmonisé */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#007A3D] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notes de Conjoncture</h1>
                <p className="text-gray-500">Analyse economique du secteur industriel camerounais</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {role && (
                <span className="px-3 py-1 bg-[#007A3D]/10 text-[#007A3D] rounded-full text-sm font-medium">
                  {role}
                </span>
              )}
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#CE1126] text-white rounded-lg hover:bg-[#a00d1e] transition"
              >
                <Download className="w-4 h-4" />
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold">Filtres</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annee</label>
              <select
                value={selectedAnnee}
                onChange={(e) => setSelectedAnnee(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les annees</option>
                {annees.map((a) => (
                  <option key={a} value={a.toString()}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
              <select
                value={selectedTrimestre}
                onChange={(e) => setSelectedTrimestre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les trimestres</option>
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t.toString()}>T{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
              <select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les secteurs</option>
                {secteurs.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Reinitialiser
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des donnees...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchData} className="mt-2 text-red-600 hover:text-red-800 underline">
              Reessayer
            </button>
          </div>
        ) : (
          <>
            {/* KPIs */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-500">Productions</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.totalProductions.toLocaleString()}</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-500">Chiffre d'affaires</span>
                  </div>
                  <div className="text-2xl font-bold">{(stats.totalCA / 1000000).toFixed(1)}M FCFA</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-sm text-gray-500">Emplois</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.totalEmplois.toLocaleString()}</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-500">Investissements</span>
                  </div>
                  <div className="text-2xl font-bold">{(stats.totalInvestissements / 1000000).toFixed(1)}M FCFA</div>
                </div>
              </div>
            )}

            {/* Graphiques */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Graphique par secteur */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Productions par secteur</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={stats.productionsParSecteur}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.productionsParSecteur.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Graphique par trimestre */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Evolution par trimestre</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.productionsParTrimestre}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="productions" fill="#007A3D" />
                      <Bar dataKey="ca" fill="#CE1126" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Tableau des productions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Detail des productions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Entreprise</th>
                      <th className="text-left py-3 px-4">Secteur</th>
                      <th className="text-left py-3 px-4">Periode</th>
                      <th className="text-right py-3 px-4">Production</th>
                      <th className="text-right py-3 px-4">CA (FCFA)</th>
                      <th className="text-right py-3 px-4">Effectifs</th>
                      <th className="text-center py-3 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productions.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{p.entreprise.denomination}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                            {p.entreprise.secteurActivite}
                          </span>
                        </td>
                        <td className="py-3 px-4">{p.annee} T{p.trimestre}</td>
                        <td className="py-3 px-4 text-right">{p.productionPhysique.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{p.chiffreAffaires.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{p.effectifs}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            p.statut === 'VALIDEE' ? 'bg-green-100 text-green-800' :
                            p.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {p.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
