"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Filter,
  ArrowLeft,
  Plus,
} from "lucide-react";

interface Production {
  id: string;
  annee: number;
  periode: string;
  trimestre: number | null;
  semestre: number | null;
  volumeProduit: number | null;
  valeurProduction: number | null;
  nombreEmployes: number | null;
  statutValidation: string;
  dateSaisie: string;
  entreprise: {
    denomination: string;
    referenceSPI: string;
  };
  saisiePar: {
    name: string;
    email: string;
  };
}

export default function ProductionsListPage() {
  const { data: session } = useSession();
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const fetchProductions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("statut", filter);

      const res = await fetch(`/api/production?${params.toString()}`);
      const data = await res.json();
      setProductions(data.productions || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProductions();
  }, [fetchProductions]);

  const handleValidate = async (id: string, action: "VALIDE" | "REJETE") => {
    try {
      const res = await fetch(`/api/production/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchProductions();
      }
    } catch (error) {
      console.error("Erreur validation:", error);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "VALIDE":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Validée
          </span>
        );
      case "REJETE":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <XCircle className="w-3 h-3" />
            Rejetée
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/agent"} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Données de production</h2>
            <p className="text-sm text-gray-500">
              {isAdmin ? "Validation et supervision" : "Mes saisies"}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <Link
            href="/production/new"
            className="px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle saisie
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007A3D] outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDE">Validées</option>
          <option value="REJETE">Rejetées</option>
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#007A3D]" />
        </div>
      ) : productions.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée de production</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Entreprise</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Période</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Volume</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Valeur</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Emplois</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                  {isAdmin && <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Agent</th>}
                  {isAdmin && <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productions.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{prod.entreprise.denomination}</p>
                        <p className="text-xs text-gray-500">{prod.entreprise.referenceSPI}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {prod.annee} - {prod.periode}
                      {prod.trimestre && ` T${prod.trimestre}`}
                      {prod.semestre && ` S${prod.semestre}`}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {prod.volumeProduit?.toLocaleString() || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {prod.valeurProduction ? `${prod.valeurProduction.toLocaleString()} FCFA` : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">{prod.nombreEmployes || "-"}</td>
                    <td className="py-3 px-4">{getStatusBadge(prod.statutValidation)}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {prod.saisiePar.name}
                      </td>
                    )}
                    {isAdmin && prod.statutValidation === "EN_ATTENTE" && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleValidate(prod.id, "VALIDE")}
                            className="px-3 py-1 bg-[#007A3D] text-white text-xs rounded hover:bg-[#006633]"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => handleValidate(prod.id, "REJETE")}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Rejeter
                          </button>
                        </div>
                      </td>
                    )}
                    {isAdmin && prod.statutValidation !== "EN_ATTENTE" && (
                      <td className="py-3 px-4 text-xs text-gray-400">-</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
