"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Filter,
  Download,
  Building2,
  BarChart3,
  PieChart,
  Eye,
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

// Helper pour formater un nombre en toute sécurité
function safeNumber(value: number | null | undefined): number {
  return value ?? 0;
}

function safeLocaleString(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('fr-FR');
}

function isPrevision(annee: number | null | undefined, trimestre: number | null | undefined): boolean {
  if (!annee || !trimestre) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentTrimestre = Math.ceil(currentMonth / 3);
  if (annee > currentYear) return true;
  if (annee === currentYear && trimestre > currentTrimestre) return true;
  return false;
}

export default function ConjonctureContent() {
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

      // Normalisation des données avec valeurs par défaut
      const normalizedStats: Stats | null = data.stats ? {
        totalProductions: data.stats.totalProductions ?? 0,
        totalCA: data.stats.totalCA ?? 0,
        totalEmplois: data.stats.totalEmplois ?? 0,
        totalInvestissements: data.stats.totalInvestissements ?? 0,
        productionsParSecteur: data.stats.productionsParSecteur || [],
        productionsParTrimestre: data.stats.productionsParTrimestre || [],
      } : null;

      setProductions(data.productions || []);
      setStats(normalizedStats);
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
          <p>Année: ${selectedAnnee || 'Toutes'} | Trimestre: ${selectedTrimestre || 'Tous'}</p>
        </div>

        <div style="text-align: center;">
          <div class="kpi">
            <div class="kpi-value">${safeLocaleString(stats?.totalProductions)}</div>
            <div>Productions</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${safeLocaleString(stats?.totalCA)} FCFA</div>
            <div>Chiffre d'affaires</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${safeLocaleString(stats?.totalEmplois)}</div>
            <div>Emplois</div>
          </div>
        </div>

        <h2>Détail des productions</h2>
        <table>
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Secteur</th>
              <th>Année</th>
              <th>Trimestre</th>
              <th>Production</th>
              <th>CA (FCFA)</th>
              <th>Effectifs</th>
            </tr>
          </thead>
          <tbody>
            ${productions.map(p => `
              <tr>
                <td>${p.entreprise?.denomination || 'N/A'}</td>
                <td>${p.entreprise?.secteurActivite || 'N/A'}</td>
                <td>${p.annee || 'N/A'}</td>
                <td>T${p.trimestre || 'N/A'}</td>
                <td>${safeLocaleString(p.productionPhysique)}</td>
                <td>${safeLocaleString(p.chiffreAffaires)}</td>
                <td>${p.effectifs ?? 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} - Portail SPI-CAM</p>
          <p>Ministère des Mines, de l'Industrie et du Développement Technologique</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      {/* Bouton export */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-[#CE1126] text-white rounded-lg hover:bg-[#a00d1e] transition"
        >
          <Download className="w-4 h-4" />
          Exporter PDF
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <select
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les années</option>
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
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchData} className="mt-2 text-red-600 hover:text-red-800 underline">
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* KPIs - Style identique à la page Production */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Productions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Productions</span>
                </div>
                <div className="text-2xl font-bold">{safeLocaleString(stats.totalProductions)}</div>
                <div className="text-sm text-gray-400 mt-1">saisies enregistrées</div>
              </div>

              {/* Chiffre d'affaires */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Chiffre d'affaires</span>
                </div>
                <div className="text-2xl font-bold">
                  {safeLocaleString(stats.totalCA)}
                </div>
                <div className="text-sm text-gray-400 mt-1">milliards de FCFA</div>
              </div>

              {/* Emplois */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-500">Emplois</span>
                </div>
                <div className="text-2xl font-bold">{safeLocaleString(stats.totalEmplois)}</div>
                <div className="text-sm text-gray-400 mt-1">employés au total</div>
              </div>

              {/* Investissements */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Investissements</span>
                </div>
                <div className="text-2xl font-bold">
                  {safeLocaleString(stats.totalInvestissements)}
                </div>
                <div className="text-sm text-gray-400 mt-1">milliards de FCFA</div>
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
                      data={stats.productionsParSecteur || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(stats.productionsParSecteur || []).map((entry, index) => (
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
                <h3 className="text-lg font-semibold mb-4">Évolution par trimestre</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.productionsParTrimestre || []}>
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
            <h3 className="text-lg font-semibold mb-4">Détail des productions</h3>
            {productions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune production trouvée pour les critères sélectionnés.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Entreprise</th>
                      <th className="text-left py-3 px-4">Secteur</th>
                      <th className="text-left py-3 px-4">Période</th>
                      <th className="text-right py-3 px-4">Production</th>
                      <th className="text-right py-3 px-4">CA (FCFA)</th>
                      <th className="text-right py-3 px-4">Effectifs</th>
                      <th className="text-center py-3 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productions.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{p.entreprise?.denomination || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                            {p.entreprise?.secteurActivite || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{p.annee || 'N/A'} T{p.trimestre || 'N/A'}</td>
                        <td className="py-3 px-4 text-right">{safeLocaleString(p.productionPhysique)}</td>
                        <td className="py-3 px-4 text-right">{safeLocaleString(p.chiffreAffaires)}</td>
                        <td className="py-3 px-4 text-right">{p.effectifs ?? 0}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              p.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                              p.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {p.statut || 'N/A'}
                            </span>
                            {isPrevision(p.annee, p.trimestre) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Eye className="w-3 h-3" /> Estimation
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
