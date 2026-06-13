"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Search, X, ChevronLeft, ChevronRight, Plus, Save, ClipboardList,
  Clock, CheckCircle, XCircle, Filter
} from "lucide-react";

interface Production {
  id: string;
  entreprise: { denomination: string; sigle: string | null };
  annee: number;
  trimestre: number;
  productionPhysique: number | null;
  chiffreAffaires: number | null;
  effectifs: number | null;
  investissements: number | null;
  statut: string;
  commentaire: string | null;
  dateSaisie: string;
}

export default function ProductionPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const isAgent = session?.user?.role === "AGENT_SAISIE";
  const canEdit = isAdmin || isAgent;

  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, validees: 0, rejetees: 0 });

  const fetchProductions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (yearFilter) params.append("year", yearFilter);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/productions?${params.toString()}`);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setProductions(data.productions || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setStats(data.stats || { total: 0, enAttente: 0, validees: 0, rejetees: 0 });
    } catch (err: any) {
      console.error("Erreur chargement productions:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, yearFilter, page]);

  useEffect(() => {
    fetchProductions();
  }, [fetchProductions]);

  const handleValidate = async (id: string, action: "VALIDEE" | "REJETEE") => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/productions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: action }),
      });

      if (!res.ok) throw new Error("Erreur validation");
      fetchProductions();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case "VALIDEE": return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "text-green-600" };
      case "EN_ATTENTE": return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "text-yellow-600" };
      case "REJETEE": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-600" };
      default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "text-gray-600" };
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productions</h1>
          <p className="text-sm text-gray-500 mt-1">Saisies trimestrielles — {isAgent ? "Mes saisies" : "Toutes les saisies"}</p>
        </div>
        {canEdit && (
          <Link href="/production/new" className="px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" />Nouvelle saisie
          </Link>
        )}
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.validees}</p>
              <p className="text-xs text-gray-500">Validées</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejetees}</p>
              <p className="text-xs text-gray-500">Rejetées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtres</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une entreprise..." className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={() => { setPage(1); fetchProductions(); }} className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition">
              <Search className="w-5 h-5" />
            </button>
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="VALIDEE">Validée</option>
            <option value="REJETEE">Rejetée</option>
          </select>
          <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Toutes les années</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>
      ) : productions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Aucune production trouvée</p>
          {canEdit && (
            <Link href="/production/new" className="px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />Créer une saisie
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Production</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (FCFA)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productions.map((p) => {
                const style = getStatusStyle(p.statut);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.entreprise?.denomination || "-"}</div>
                      {p.entreprise?.sigle && <div className="text-sm text-gray-500">{p.entreprise.sigle}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.annee} T{p.trimestre}</td>
                    <td className="px-6 py-4 text-sm text-right">{p.productionPhysique?.toLocaleString() || "-"}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{p.chiffreAffaires?.toLocaleString() || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                        {p.statut === "VALIDEE" ? <CheckCircle className={`w-3 h-3 ${style.icon}`} /> :
                         p.statut === "EN_ATTENTE" ? <Clock className={`w-3 h-3 ${style.icon}`} /> :
                         <XCircle className={`w-3 h-3 ${style.icon}`} />}
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && p.statut === "EN_ATTENTE" && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleValidate(p.id, "VALIDEE")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Valider">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleValidate(p.id, "REJETEE")} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Rejeter">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"><ChevronLeft className="w-4 h-4" />Précédent</button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2">Suivant<ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
