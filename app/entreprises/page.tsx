"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Grid3X3,
  List,
  Filter,
  X,
  ChevronDown,
  User,
  SlidersHorizontal
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface Entreprise {
  id: string;
  nom: string;
  sigle: string | null;
  secteurActivite: string | null;
  region: string | null;
  ville: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  nomContact: string | null;
  description: string | null;
  statut: string;
}

// ============================================================
// SECTEURS (statiques car définis par le métier)
// ============================================================
const SECTEURS = [
  { label: "Tous les secteurs", value: "" },
  { label: "Agriculture / Agro-industrie", value: "Agriculture / Agro-industrie" },
  { label: "BTP / Matériaux", value: "BTP / Matériaux" },
  { label: "Chimie / Plastique", value: "Chimie / Plastique" },
  { label: "Commerce", value: "Commerce" },
  { label: "Énergie", value: "Énergie" },
  { label: "Environnement / Déchets", value: "Environnement / Déchets" },
  { label: "Finance", value: "Finance" },
  { label: "Forêt / Bois", value: "Forêt / Bois" },
  { label: "Industrie légère", value: "Industrie légère" },
  { label: "Métallurgie", value: "Métallurgie" },
  { label: "Pharmaceutique", value: "Pharmaceutique" },
  { label: "Sécurité / Défense", value: "Sécurité / Défense" },
  { label: "Télécommunications / IT", value: "Télécommunications / IT" },
  { label: "Textile / Habillement", value: "Textile / Habillement" },
  { label: "Tourisme / Hôtellerie", value: "Tourisme / Hôtellerie" },
  { label: "Transport / Logistique", value: "Transport / Logistique" },
];

// ============================================================
// COULEURS SECTEUR
// ============================================================
function getSectorColor(sector: string | null): string {
  if (!sector) return "bg-gray-100 text-gray-700 border-gray-300";
  const s = sector.toUpperCase();
  if (s.includes("BTP") || s.includes("CONSTRUCTION")) return "bg-orange-100 text-orange-700 border-orange-300";
  if (s.includes("TÉLÉCOM") || s.includes("TELECOM") || s.includes("IT") || s.includes("TECHNO")) return "bg-indigo-100 text-indigo-700 border-indigo-300";
  if (s.includes("TRANSPORT") || s.includes("LOGISTIQUE")) return "bg-red-100 text-red-700 border-red-300";
  if (s.includes("ÉNERGIE") || s.includes("ENERGIE")) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  if (s.includes("MÉTALLURGIE") || s.includes("METALLURGIE")) return "bg-slate-100 text-slate-700 border-slate-300";
  if (s.includes("FINANCE") || s.includes("BANQUE")) return "bg-cyan-100 text-cyan-700 border-cyan-300";
  if (s.includes("PHARMA") || s.includes("MÉDICAL") || s.includes("MEDICAL")) return "bg-purple-100 text-purple-700 border-purple-300";
  if (s.includes("SÉCURITÉ") || s.includes("SECURITE") || s.includes("DÉFENSE") || s.includes("DEFENSE")) return "bg-gray-100 text-gray-700 border-gray-300";
  if (s.includes("TOURISME") || s.includes("HÔTEL") || s.includes("HOTEL")) return "bg-pink-100 text-pink-700 border-pink-300";
  if (s.includes("FORÊT") || s.includes("FORET") || s.includes("BOIS")) return "bg-green-100 text-green-700 border-green-300";
  if (s.includes("CHIMIE") || s.includes("PLASTIQUE")) return "bg-blue-100 text-blue-700 border-blue-300";
  if (s.includes("ENVIRONNEMENT") || s.includes("DÉCHET") || s.includes("DECHET")) return "bg-teal-100 text-teal-700 border-teal-300";
  if (s.includes("TEXTILE") || s.includes("HABILLEMENT")) return "bg-rose-100 text-rose-700 border-rose-300";
  if (s.includes("AGRICULTURE") || s.includes("AGRO")) return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (s.includes("COMMERCE") || s.includes("VENTE")) return "bg-gray-100 text-gray-700 border-gray-300";
  if (s.includes("INDUSTRIE") || s.includes("MANUFACTURE")) return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-gray-100 text-gray-700 border-gray-300";
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function AnnuairePage() {
  const searchParams = useSearchParams();
  const sectorParam = searchParams.get("sector");

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtres
  const [searchText, setSearchText] = useState("");
  const [selectedSector, setSelectedSector] = useState(sectorParam || "");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedVille, setSelectedVille] = useState("");
  const [regionText, setRegionText] = useState("");
  const [villeText, setVilleText] = useState("");

  // Vue
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch
  const fetchEntreprises = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/entreprises");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setEntreprises(data.entreprises || data || []);
    } catch (err) {
      setError("Impossible de charger les entreprises");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntreprises();
  }, [fetchEntreprises]);

  // --- DYNAMIQUE : extraire régions et villes uniques ---
  const { regionsUniques, villesUniques } = useMemo(() => {
    const regions = Array.from(new Set(entreprises.map((e) => e.region).filter(Boolean))).sort();
    const villes = Array.from(new Set(entreprises.map((e) => e.ville).filter(Boolean))).sort();
    return { regionsUniques: regions as string[], villesUniques: villes as string[] };
  }, [entreprises]);

  // Villes filtrées par région si une région est sélectionnée
  const villesFiltrees = useMemo(() => {
    if (!selectedRegion) return villesUniques;
    return Array.from(
      new Set(
        entreprises
          .filter((e) => e.region === selectedRegion)
          .map((e) => e.ville)
          .filter(Boolean)
      )
    ).sort();
  }, [entreprises, selectedRegion, villesUniques]);

  // --- FILTRAGE ---
  const filtered = useMemo(() => {
    return entreprises.filter((e) => {
      const matchText =
        !searchText ||
        e.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
        e.sigle?.toLowerCase().includes(searchText.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        e.nomContact?.toLowerCase().includes(searchText.toLowerCase());

      const matchSector = !selectedSector || e.secteurActivite === selectedSector;

      const matchRegion =
        (!selectedRegion || e.region === selectedRegion) &&
        (!regionText || e.region?.toLowerCase().includes(regionText.toLowerCase()));

      const matchVille =
        (!selectedVille || e.ville === selectedVille) &&
        (!villeText || e.ville?.toLowerCase().includes(villeText.toLowerCase()));

      return matchText && matchSector && matchRegion && matchVille;
    });
  }, [entreprises, searchText, selectedSector, selectedRegion, selectedVille, regionText, villeText]);

  // Reset
  const hasActiveFilters =
    searchText || selectedSector || selectedRegion || selectedVille || regionText || villeText;
  const clearFilters = () => {
    setSearchText("");
    setSelectedSector("");
    setSelectedRegion("");
    setSelectedVille("");
    setRegionText("");
    setVilleText("");
  };

  const activeFilterCount = [
    selectedSector,
    selectedRegion,
    selectedVille,
    regionText,
    villeText,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-[#007A3D] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#007A3D]" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Portail SPI Cam</h1>
              <p className="text-xs text-white/80">Suivi de la Production Industrielle</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Titre */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#007A3D]/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#007A3D]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Annuaire des entreprises</h1>
              <p className="text-gray-500">Entreprises répertoriées dans le portail SPI-CAM</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {entreprises.length} entreprises répertoriées
            {filtered.length !== entreprises.length && (
              <span className="text-[#007A3D] font-medium">
                {" "}— {filtered.length} résultat{filtered.length > 1 ? "s" : ""} trouvé
                {filtered.length > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>

        {/* --- BARRE DE RECHERCHE & FILTRES --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          {/* Ligne 1 : Recherche + boutons */}
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, sigle, description, contact..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A3D]/20 focus:border-[#007A3D] transition-all"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg border font-medium text-sm flex items-center gap-2 transition-all ${
                  showFilters || activeFilterCount > 0
                    ? "bg-[#007A3D] text-white border-[#007A3D]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="bg-white text-[#007A3D] text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-[#007A3D]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Vue liste"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-[#007A3D]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Vue cartes"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* --- Ligne 2 : Filtres avancés --- */}
          {showFilters && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Filtre secteur */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Secteur d'activité</label>
                  <div className="relative">
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#007A3D]/20 focus:border-[#007A3D] text-sm"
                    >
                      {SECTEURS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Région : dropdown dynamique + saisie libre */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Région</label>
                  <div className="relative">
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedVille("");
                        setRegionText("");
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#007A3D]/20 focus:border-[#007A3D] text-sm"
                    >
                      <option value="">Toutes les régions</option>
                      {regionsUniques.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ou saisir une région..."
                    value={regionText}
                    onChange={(e) => {
                      setRegionText(e.target.value);
                      setSelectedRegion("");
                    }}
                    className="w-full mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007A3D]/20 focus:border-[#007A3D]"
                  />
                </div>

                {/* Ville : dropdown dynamique + saisie libre */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
                  <div className="relative">
                    <select
                      value={selectedVille}
                      onChange={(e) => {
                        setSelectedVille(e.target.value);
                        setVilleText("");
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#007A3D]/20 focus:border-[#007A3D] text-sm"
                    >
                      <option value="">Toutes les villes</option>
                      {villesFiltrees.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ou saisir une ville..."
                    value={villeText}
                    onChange={(e) => {
                      setVilleText(e.target.value);
                      setSelectedVille("");
                    }}
                    className="w-full mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007A3D]/20 focus:border-[#007A3D]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- Tags de filtres actifs --- */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {searchText && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#007A3D]/10 text-[#007A3D] text-sm rounded-full">
                  🔍 {searchText}
                  <button onClick={() => setSearchText("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSector && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                  {selectedSector}
                  <button onClick={() => setSelectedSector("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedRegion && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                  <MapPin className="w-3 h-3" /> {selectedRegion}
                  <button onClick={() => setSelectedRegion("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {regionText && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-full border border-orange-200">
                  <MapPin className="w-3 h-3" /> Région: {regionText}
                  <button onClick={() => setRegionText("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedVille && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  <MapPin className="w-3 h-3" /> {selectedVille}
                  <button onClick={() => setSelectedVille("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {villeText && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full border border-purple-200">
                  <MapPin className="w-3 h-3" /> Ville: {villeText}
                  <button onClick={() => setVilleText("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-[#CE1126] underline ml-auto"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          )}
        </div>

        {/* --- LOADING --- */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#007A3D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement des entreprises...</p>
          </div>
        )}

        {/* --- ERROR --- */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button
              onClick={fetchEntreprises}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* --- RÉSULTATS --- */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Aucune entreprise trouvée
                </h3>
                <p className="text-gray-500 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* === VUE LISTE === */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {filtered.map((entreprise) => (
                      <div
                        key={entreprise.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#007A3D]/30 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-bold text-gray-900">
                                {entreprise.nom}
                              </h3>
                              {entreprise.sigle && (
                                <span className="text-sm text-gray-500">
                                  ({entreprise.sigle})
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  entreprise.statut === "ACTIF"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {entreprise.statut}
                              </span>
                            </div>

                            {entreprise.secteurActivite && (
                              <span
                                className={`inline-block px-3 py-1 text-xs font-medium rounded-full border mb-3 ${getSectorColor(
                                  entreprise.secteurActivite
                                )}`}
                              >
                                {entreprise.secteurActivite}
                              </span>
                            )}

                            {entreprise.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {entreprise.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              {(entreprise.ville || entreprise.region) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-[#007A3D]" />
                                  {entreprise.ville}
                                  {entreprise.ville && entreprise.region ? ", " : ""}
                                  {entreprise.region}
                                </span>
                              )}
                              {entreprise.telephone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-4 h-4 text-[#007A3D]" />
                                  {entreprise.telephone}
                                </span>
                              )}
                              {entreprise.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4 text-[#007A3D]" />
                                  {entreprise.email}
                                </span>
                              )}
                              {entreprise.nomContact && (
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4 text-[#007A3D]" />
                                  Contact: {entreprise.nomContact}
                                </span>
                              )}
                            </div>

                            {entreprise.adresse && (
                              <p className="text-sm text-gray-400 mt-2">
                                {entreprise.adresse}
                              </p>
                            )}
                          </div>

                          <div className="flex md:flex-col gap-2">
                            <span className="text-xs text-gray-400 font-mono">
                              {entreprise.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* === VUE GRILLE === */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((entreprise) => (
                      <div
                        key={entreprise.id}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#007A3D]/30 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-[#007A3D]/10 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-[#007A3D]" />
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              entreprise.statut === "ACTIF"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {entreprise.statut}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1 truncate">
                          {entreprise.nom}
                        </h3>
                        {entreprise.sigle && (
                          <p className="text-sm text-gray-500 mb-2">
                            ({entreprise.sigle})
                          </p>
                        )}

                        {entreprise.secteurActivite && (
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border mb-3 ${getSectorColor(
                              entreprise.secteurActivite
                            )}`}
                          >
                            {entreprise.secteurActivite}
                          </span>
                        )}

                        <div className="space-y-1.5 text-sm text-gray-500">
                          {(entreprise.ville || entreprise.region) && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate">
                                {entreprise.ville}
                                {entreprise.ville && entreprise.region ? ", " : ""}
                                {entreprise.region}
                              </span>
                            </p>
                          )}
                          {entreprise.telephone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate">
                                {entreprise.telephone}
                              </span>
                            </p>
                          )}
                          {entreprise.email && (
                            <p className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate">
                                {entreprise.email}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-mono">
                            {entreprise.id}
                          </span>
                          {entreprise.nomContact && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" /> {entreprise.nomContact}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-[#007A3D]" />
            <span className="font-bold">Portail SPI Cam</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 Portail SPI Cam - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
