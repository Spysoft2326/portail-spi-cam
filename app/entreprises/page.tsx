"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Entreprise {
  id: string;
  denomination: string;
  sigle: string | null;
  secteurActivite: string;
  ville: string | null;
  region: string;
  siteWeb: string | null;
  produitsPrincipaux: string | null;
  statut: string;
}

interface Filters {
  sectors: string[];
  regions: string[];
  cities: string[];
}

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [filters, setFilters] = useState<Filters>({ sectors: [], regions: [], cities: [] });
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEntreprises = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedSector) params.append("sector", selectedSector);
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedCity) params.append("city", selectedCity);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/entreprises?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      setEntreprises(data.entreprises);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setFilters(data.filters);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntreprises();
  }, [search, selectedSector, selectedRegion, selectedCity, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEntreprises();
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSector("");
    setSelectedRegion("");
    setSelectedCity("");
    setPage(1);
  };

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      AGRICULTURE: "bg-green-100 text-green-800",
      AGROALIMENTAIRE: "bg-emerald-100 text-emerald-800",
      TECHNOLOGIE: "bg-blue-100 text-blue-800",
      TELECOMMUNICATIONS: "bg-indigo-100 text-indigo-800",
      E_COMMERCE: "bg-purple-100 text-purple-800",
      FINTECH: "bg-pink-100 text-pink-800",
      ENERGIE: "bg-yellow-100 text-yellow-800",
      MINES: "bg-orange-100 text-orange-800",
      BANQUE: "bg-cyan-100 text-cyan-800",
      MICROFINANCE: "bg-teal-100 text-teal-800",
      TRANSPORT: "bg-red-100 text-red-800",
      LOGISTIQUE: "bg-rose-100 text-rose-800",
      CONSTRUCTION: "bg-stone-100 text-stone-800",
      IMMOBILIER: "bg-amber-100 text-amber-800",
      SANTE: "bg-red-50 text-red-700",
      PHARMACIE: "bg-violet-100 text-violet-800",
      EDUCATION: "bg-sky-100 text-sky-800",
      FORMATION: "bg-lime-100 text-lime-800",
      COMMERCE: "bg-gray-100 text-gray-800",
      HOTELLERIE: "bg-fuchsia-100 text-fuchsia-800",
      TOURISME: "bg-pink-50 text-pink-700",
      MEDIA: "bg-slate-100 text-slate-800",
    };
    return colors[sector] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header harmonise avec le dashboard */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Annuaire des entreprises du secteur industriel du Cameroun
              </h1>
              <p className="text-blue-200 text-lg mt-1">
                {total} entreprises referencees dans le portail SPI-CAM
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
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom, sigle, description..."
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition"
                  >
                    Rechercher
                  </button>
                </div>
              </div>

              {/* Secteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secteur
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les secteurs</option>
                  {filters.sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => { setSelectedRegion(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les regions</option>
                  {filters.regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ville + Reset */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les villes</option>
                  {filters.cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Reinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Resultats */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des entreprises...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchEntreprises}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Reessayer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {total} resultat{total > 1 ? "s" : ""} trouve{total > 1 ? "s" : ""}
              {(search || selectedSector || selectedRegion || selectedCity) && " (filtres)"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entreprises.map((e) => (
                <Link
                  key={e.id}
                  href={`/entreprises/detail/${e.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSectorColor(e.secteurActivite)}`}>
                      {e.secteurActivite}
                    </span>
                    <span className="text-gray-400 group-hover:text-blue-600 transition">
                      Voir
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                    {e.denomination}
                  </h3>

                  {e.sigle && (
                    <p className="text-sm text-gray-500 mb-2">{e.sigle}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <span>{e.ville || "N/A"}</span>
                    <span>{e.region}</span>
                  </div>

                  {e.produitsPrincipaux && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {e.produitsPrincipaux}
                    </p>
                  )}

                  {e.siteWeb && (
                    <p className="text-sm text-blue-600 mt-2 truncate">
                      {e.siteWeb}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Precedent
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer harmonise */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>2026 Portail SPI-CAM - Ministere de l Industrie du Cameroun</p>
            <div className="flex gap-4">
              <Link href="/dashboard/super-admin" className="hover:text-blue-600 transition">
                Tableau de bord
              </Link>
              <Link href="/entreprises" className="hover:text-blue-600 transition">
                Annuaire
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
