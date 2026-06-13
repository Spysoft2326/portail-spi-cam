"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Search, X, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Save,
  Download, Filter, LayoutGrid, List,
  // Icones secteurs
  Sprout, UtensilsCrossed, HardHat, FlaskConical, ShoppingCart, 
  Radio, Building, GraduationCap, Zap, Sun,
  TreePine, Landmark, Smartphone, BookOpen, Hotel,
  Home, Factory, Truck, Newspaper, PiggyBank,
  Mountain, Pill, HeartPulse, Shield, Cpu,
  Wifi, Shirt, Plane, Bus, MoreHorizontal,
  Leaf, Beaker, Briefcase, BarChart3, TrendingUp,
  Users, DollarSign, MapPin, Calendar, FileSpreadsheet,
  ArrowRight, Globe
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

// Icones par secteur
const SECTOR_ICONS: Record<string, React.ElementType> = {
  Agriculture: Sprout,
  Agroalimentaire: UtensilsCrossed,
  BTP: HardHat,
  Chimie: FlaskConical,
  Commerce: ShoppingCart,
  Communication: Radio,
  Construction: Building,
  Education: GraduationCap,
  Energie: Zap,
  "Energie renouvelable": Sun,
  Environnement: TreePine,
  Finance: Landmark,
  Fintech: Smartphone,
  Formation: BookOpen,
  Hotellerie: Hotel,
  Immobilier: Home,
  Industrie: Factory,
  Logistique: Truck,
  Media: Newspaper,
  Microfinance: PiggyBank,
  Mines: Mountain,
  Pharmaceutique: Pill,
  Sante: HeartPulse,
  Securite: Shield,
  Technologie: Cpu,
  Telecommunications: Wifi,
  Textile: Shirt,
  Tourisme: Plane,
  Transport: Bus,
  Autre: MoreHorizontal,
};

// Couleurs par secteur
const SECTOR_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Agriculture: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "text-green-600" },
  Agroalimentaire: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-600" },
  BTP: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "text-orange-600" },
  Chimie: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "text-blue-600" },
  Commerce: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "text-gray-600" },
  Communication: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "text-indigo-600" },
  Construction: { bg: "bg-stone-50", text: "text-stone-700", border: "border-stone-200", icon: "text-stone-600" },
  Education: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: "text-sky-600" },
  Energie: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "text-yellow-600" },
  "Energie renouvelable": { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", icon: "text-lime-600" },
  Environnement: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "text-teal-600" },
  Finance: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: "text-cyan-600" },
  Fintech: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", icon: "text-pink-600" },
  Formation: { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", icon: "text-lime-600" },
  Hotellerie: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", icon: "text-fuchsia-600" },
  Immobilier: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "text-amber-600" },
  Industrie: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: "text-slate-600" },
  Logistique: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "text-rose-600" },
  Media: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "text-violet-600" },
  Microfinance: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "text-teal-600" },
  Mines: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "text-orange-600" },
  Pharmaceutique: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "text-purple-600" },
  Sante: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-600" },
  Securite: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "text-gray-600" },
  Technologie: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "text-blue-600" },
  Telecommunications: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "text-indigo-600" },
  Textile: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "text-orange-600" },
  Tourisme: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", icon: "text-pink-600" },
  Transport: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-600" },
  Autre: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "text-gray-600" },
};

const ALL_SECTORS = [
  { value: "Agriculture", label: "Agriculture" },
  { value: "Agroalimentaire", label: "Agroalimentaire" },
  { value: "BTP", label: "BTP / Materiaux" },
  { value: "Chimie", label: "Chimie / Plastique" },
  { value: "Commerce", label: "Commerce" },
  { value: "Communication", label: "Communication / Medias" },
  { value: "Construction", label: "Construction" },
  { value: "Education", label: "Education" },
  { value: "Energie", label: "Energie" },
  { value: "Energie renouvelable", label: "Energie renouvelable" },
  { value: "Environnement", label: "Environnement" },
  { value: "Finance", label: "Finance" },
  { value: "Fintech", label: "Fintech" },
  { value: "Formation", label: "Formation" },
  { value: "Hotellerie", label: "Hotellerie" },
  { value: "Immobilier", label: "Immobilier" },
  { value: "Industrie", label: "Industrie" },
  { value: "Logistique", label: "Logistique" },
  { value: "Media", label: "Medias" },
  { value: "Microfinance", label: "Microfinance" },
  { value: "Mines", label: "Mines" },
  { value: "Pharmaceutique", label: "Pharmaceutique" },
  { value: "Sante", label: "Sante" },
  { value: "Securite", label: "Securite" },
  { value: "Technologie", label: "Technologie" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Textile", label: "Textile" },
  { value: "Tourisme", label: "Tourisme" },
  { value: "Transport", label: "Transport" },
  { value: "Autre", label: "Autre" },
];

export default function EntreprisesContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formData, setFormData] = useState({
    denomination: "",
    sigle: "",
    secteurActivite: "Autre",
    ville: "",
    region: "Centre",
    siteWeb: "",
    produitsPrincipaux: "",
    statut: "ACTIF",
  });
  const [submitLoading, setSubmitLoading] = useState(false);

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

      const res = await fetch(`/api/entreprises?${params.toString()}`);
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

  // Lire les parametres URL au chargement initial (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const urlSearch = url.searchParams.get("search") || "";
      const urlSector = url.searchParams.get("sector") || "";
      const urlRegion = url.searchParams.get("region") || "";
      const urlCity = url.searchParams.get("city") || "";

      if (urlSearch) setSearch(urlSearch);
      if (urlSector) setSelectedSector(urlSector);
      if (urlRegion) setSelectedRegion(urlRegion);
      if (urlCity) setSelectedCity(urlCity);
    }
  }, []);

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
      secteurActivite: "Autre",
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
    setSubmitLoading(true);

    try {
      if (editingEntreprise) {
        const res = await fetch(`/api/entreprises/${editingEntreprise.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Erreur ${res.status}`);
        }

        const updated = await res.json();
        setEntreprises((prev) =>
          prev.map((en) => (en.id === editingEntreprise.id ? updated : en))
        );
      } else {
        const res = await fetch("/api/entreprises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Erreur ${res.status}`);
        }

        const created = await res.json();
        setEntreprises((prev) => [...prev, created]);
        setTotal((t) => t + 1);
      }

      setShowModal(false);
      fetchEntreprises();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Etes-vous sur de vouloir supprimer cette entreprise ?")) return;

    try {
      const res = await fetch(`/api/entreprises/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Erreur ${res.status}`);
      }

      setEntreprises((prev) => prev.filter((en) => en.id !== id));
      setTotal((t) => t - 1);
    } catch (err: any) {
      alert("Erreur suppression : " + err.message);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Denomination", "Sigle", "Secteur", "Ville", "Region", "Site Web", "Produits", "Statut"];
    const rows = entreprises.map((e) => [
      e.denomination,
      e.sigle || "",
      e.secteurActivite,
      e.ville || "",
      e.region,
      e.siteWeb || "",
      e.produitsPrincipaux || "",
      e.statut,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(";"))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `entreprises-spi-cam-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getSectorStyle = (sector: string) => {
    return SECTOR_COLORS[sector] || SECTOR_COLORS["Autre"];
  };

  const getSectorIcon = (sector: string) => {
    return SECTOR_ICONS[sector] || MoreHorizontal;
  };

  return (
    <div>
      {/* Header avec boutons d action */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annuaire des Entreprises</h1>
          <p className="text-sm text-gray-500 mt-1">{total} entreprises repertoriees</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Ajouter
            </button>
          )}
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtres ameliores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-700">Filtres</h2>
          {(selectedSector || selectedRegion || selectedCity || searchQuery) && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Actifs
            </span>
          )}
        </div>

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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
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
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {total} resultat{total > 1 ? "s" : ""} trouve{total > 1 ? "s" : ""}
              {(searchQuery || selectedSector || selectedRegion || selectedCity) && " (filtres)"}
            </span>
          </div>

          {/* Vue GRILLE */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entreprises.map((e) => {
                const SectorIcon = getSectorIcon(e.secteurActivite);
                const style = getSectorStyle(e.secteurActivite);

                return (
                  <Link href={`/entreprises/${e.id}`} key={e.id} className="block group">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 cursor-pointer h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                          <SectorIcon className={`w-3.5 h-3.5 ${style.icon}`} />
                          {e.secteurActivite}
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                          {isAdmin && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(ev) => ev.preventDefault()}>
                              <button
                                onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); openEditModal(e); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Modifier"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); handleDelete(e.id); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                        {e.denomination}
                      </h3>

                      {e.sigle && <p className="text-sm text-gray-500 mb-3 font-medium">{e.sigle}</p>}

                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {e.ville || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {e.region}
                        </span>
                      </div>

                      {e.produitsPrincipaux && (
                        <p className="text-sm text-gray-500 mt-3 line-clamp-2 bg-gray-50 p-2 rounded-lg">
                          {e.produitsPrincipaux}
                        </p>
                      )}

                      {e.siteWeb && (
                        <p className="text-sm text-blue-600 mt-3 truncate flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {e.siteWeb}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Vue LISTE */}
          {viewMode === "list" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Secteur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localisation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entreprises.map((e) => {
                    const SectorIcon = getSectorIcon(e.secteurActivite);
                    const style = getSectorStyle(e.secteurActivite);

                    return (
                      <tr key={e.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => window.location.href = `/entreprises/${e.id}`}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{e.denomination}</div>
                          {e.sigle && <div className="text-sm text-gray-500">{e.sigle}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                            <SectorIcon className={`w-3 h-3 ${style.icon}`} />
                            {e.secteurActivite}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {e.ville || "N/A"}, {e.region}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {e.produitsPrincipaux || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/entreprises/${e.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Voir le detail"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={(ev) => { ev.stopPropagation(); openEditModal(e); }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Modifier"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

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
      {isAdmin && showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingEntreprise ? "Modifier l entreprise" : "Ajouter une entreprise"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Denomination *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d activite</label>
                <select
                  value={formData.secteurActivite}
                  onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {ALL_SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                    <option value="Extreme-Nord">Extreme-Nord</option>
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
                  disabled={submitLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
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
