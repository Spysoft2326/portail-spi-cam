"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Shield,
} from "lucide-react";

interface Production {
  id: string;
  annee: number;
  trimestre: number;
  productionPhysique: number | null;
  chiffreAffaires: number | null;
  effectifs: number | null;
  investissements: number | null;
  statut: string;
  commentaire: string | null;
  dateSaisie: string;
  dateValidation: string | null;
  entreprise: {
    id: string;
    denomination: string;
    referenceSPI: string;
  };
}

export default function ProductionPage() {
  const { data: session } = useSession();
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState("");
  const [filterAnnee, setFilterAnnee] = useState("");
  const [search, setSearch] = useState("");

  const role = session?.user?.role || "";
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role);

  useEffect(() => {
    fetchProductions();
  }, [filterStatut, filterAnnee]);

  const fetchProductions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatut) params.append("statut", filterStatut);
      if (filterAnnee) params.append("annee", filterAnnee);

      const res = await fetch(`/api/production?${params}`);
      const data = await res.json();
      setProductions(data.productions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProductions = productions.filter((p) =>
    search
      ? p.entreprise.denomination.toLowerCase().includes(search.toLowerCase()) ||
        p.entreprise.referenceSPI.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "VALIDEE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Validée
          </span>
        );
      case "REJETEE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <XCircle className="w-3.5 h-3.5" />
            Rejetée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
            <Clock className="w-3.5 h-3.5" />
            En attente
          </span>
        );
    }
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
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Productions</h1>
                <p className="text-gray-500">
                  Saisies trimestrielles {isAdmin ? "- Toutes les données" : "- Mes saisies"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {role && (
                <span className="px-3 py-1 bg-[#007A3D]/10 text-[#007A3D] rounded-full text-sm font-medium">
                  {role}
                </span>
              )}
              <Link
                href="/production/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Nouvelle saisie
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: productions.length, icon: ClipboardList, color: "bg-gray-50 text-gray-600" },
            {
              label: "En attente",
              value: productions.filter((p) => p.statut === "EN_ATTENTE").length,
              icon: Clock,
              color: "bg-yellow-50 text-yellow-600",
            },
            {
              label: "Validées",
              value: productions.filter((p) => p.statut === "VALIDEE").length,
              icon: CheckCircle2,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Rejetées",
              value: productions.filter((p) => p.statut === "REJETEE").length,
              icon: XCircle,
              color: "bg-red-50 text-red-600",
            },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color.split(' ')[0]} rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${stat.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none bg-white"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDEE">Validées</option>
                <option value="REJETEE">Rejetées</option>
              </select>
              <select
                value={filterAnnee}
                onChange={(e) => setFilterAnnee(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none bg-white"
              >
                <option value="">Toutes les années</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007A3D]"></div>
            </div>
          ) : filteredProductions.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune production trouvée</p>
              <Link
                href="/production/new"
                className="text-[#007A3D] hover:text-[#006633] text-sm mt-2 inline-block"
              >
                Créer une saisie →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Entreprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Période
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Production
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      CA (FCFA)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProductions.map((production) => (
                    <tr key={production.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {production.entreprise.denomination}
                          </p>
                          <p className="text-xs text-gray-500">
                            {production.entreprise.referenceSPI}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          T{production.trimestre} {production.annee}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-900">
                          {production.productionPhysique?.toLocaleString() || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-900">
                          {production.chiffreAffaires
                            ? `${production.chiffreAffaires.toLocaleString()} F`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatutBadge(production.statut)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/production/${production.id}`}
                          className="text-sm text-[#007A3D] hover:text-[#006633] font-medium"
                        >
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
