"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, X, ChevronLeft, ChevronRight, Building2, Plus, Pencil, Trash2, Save,
} from "lucide-react";

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

export default function EntreprisesContent() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState<Entreprise | null>(null);
  const [formData, setFormData] = useState({
    denomination: "",
    sigle: "",
    secteurActivite: "AUTRE",
    ville: "",
    region: "Centre",
    siteWeb: "",
    produitsPrincipaux: "",
    statut: "ACTIF",
  });

  const fetchEntreprises = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedSector) params.append("sector", selectedSector);
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedCity) params.append("city", selectedCity);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/public/entreprises?${params.toString()}`);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setEntreprises(data.entreprises || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setFilters(data.filters || { sectors: [], regions: [], cities: [] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSector, selectedRegion, selectedCity, page]);

  useEffect(() => {
    fetchEntreprises();
  }, [fetchEntreprises]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchQuery("");
    setSelectedSector("");
    setSelectedRegion("");
    setSelectedCity("");
    setPage(1);
  };

  const openAddModal = () => {
    setEditingEntreprise(null);
    setFormData({
      denomination: "",
      sigle: "",
      secteurActivite: "AUTRE",
      ville: "",
      region: "Centre",
      siteWeb: "",
      produitsPrincipaux: "",
      statut: "ACTIF",
    });
    setShowModal(true);
  };

  const openEditModal = (entreprise: Entreprise) => {
    setEditingEntreprise(entreprise);
    setFormData({
      denomination: entreprise.denomination,
      sigle: entreprise.sigle || "",
      secteurActivite: entreprise.secteurActivite,
      ville: entreprise.ville || "",
      region: entreprise.region,
      siteWeb: entreprise.siteWeb || "",
      produitsPrincipaux: entreprise.produitsPrincipaux || "",
      statut: entreprise.statut,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEntreprise) {
      // Modifier
      setEntreprises((prev) =>
        prev.map((en) =>
          en.id === editingEntreprise.id
            ? { ...en, ...formData }
            : en
        )
      );
      // TODO: Appel API
      // await fetch(`/api/entreprises/${editingEntreprise.id}`, { method: "PUT", body: JSON.stringify(formData) });
    } else {
      // Ajouter
      const newEntreprise: Entreprise = {
        id: Date.now().toString(),
        ...formData,
        sigle: formData.sigle || null,
        ville: formData.ville || null,
        siteWeb: formData.siteWeb || null,
        produitsPrincipaux: formData.produitsPrincipaux || null,
      };
      setEntreprises((prev) => [...prev, newEntreprise]);
      // TODO: Appel API
      // await fetch("/api/entreprises", { method: "POST", body: JSON.stringify(formData) });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
      setEntreprises((prev) => prev.filter((en) => en.id !== id));
      // TODO: Appel API
      // await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
    }
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
    <div>
      {/* Bouton ajouter */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter une entreprise
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
              <div className="flex">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, sigle, description..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
              <select
                value={selectedSector}
                onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les secteurs</option>
                {(filters?.sectors || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => { setSelectedRegion(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les regions</option>
                {(filters?.regions || []).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les villes</option>
                {(filters?.cities || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
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
          <button onClick={fetchEntreprises} className="mt-2 text-red-600 hover:text-red-800 underline">
            Reessayer
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {total} resultat{total > 1 ? "s" : ""} trouve{total > 1 ? "s" : ""}
            {(searchQuery || selectedSector || selectedRegion || selectedCity) && " (filtres)"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entreprises.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSectorColor(e.secteurActivite)}`}>
                    {e.secteurActivite}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(e)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {e.denomination}
                </h3>

                {e.sigle && <p className="text-sm text-gray-500 mb-2">{e.sigle}</p>}

                <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                  <span>{e.ville || "N/A"}</span>
                  <span>{e.region}</span>
                </div>

                {e.produitsPrincipaux && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{e.produitsPrincipaux}</p>
                )}

                {e.siteWeb && (
                  <p className="text-sm text-blue-600 mt-2 truncate">{e.siteWeb}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Precedent
              </button>
              <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingEntreprise ? "Modifier l'entreprise" : "Ajouter une entreprise"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dénomination *</label>
                <input
                  type="text"
                  value={formData.denomination}
                  onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sigle</label>
                <input
                  type="text"
                  value={formData.sigle}
                  onChange={(e) => setFormData({ ...formData, sigle: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
                <select
                  value={formData.secteurActivite}
                  onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="AUTRE">Autre</option>
                  <option value="AGRICULTURE">Agriculture</option>
                  <option value="AGROALIMENTAIRE">Agroalimentaire</option>
                  <option value="BTP">BTP / Matériaux</option>
                  <option value="CHIMIE">Chimie / Plastique</option>
                  <option value="COMMERCE">Commerce</option>
                  <option value="ENERGIE">Énergie</option>
                  <option value="FINANCE">Finance</option>
                  <option value="IMMOBILIER">Immobilier</option>
                  <option value="INDUSTRIE">Industrie</option>
                  <option value="LOGISTIQUE">Logistique</option>
                  <option value="MINES">Mines</option>
                  <option value="SANTE">Santé</option>
                  <option value="TECHNOLOGIE">Technologie</option>
                  <option value="TELECOMMUNICATIONS">Télécommunications</option>
                  <option value="TRANSPORT">Transport</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Centre">Centre</option>
                    <option value="Littoral">Littoral</option>
                    <option value="Ouest">Ouest</option>
                    <option value="Nord">Nord</option>
                    <option value="Sud">Sud</option>
                    <option value="Est">Est</option>
                    <option value="Adamaoua">Adamaoua</option>
                    <option value="Nord-Ouest">Nord-Ouest</option>
                    <option value="Sud-Ouest">Sud-Ouest</option>
                    <option value="Extrême-Nord">Extrême-Nord</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Web</label>
                <input
                  type="url"
                  value={formData.siteWeb}
                  onChange={(e) => setFormData({ ...formData, siteWeb: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produits principaux</label>
                <textarea
                  value={formData.produitsPrincipaux}
                  onChange={(e) => setFormData({ ...formData, produitsPrincipaux: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingEntreprise ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
