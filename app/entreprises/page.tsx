"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  ArrowLeft,
  TreePine,
  Factory,
  Briefcase,
  Store,
  HardHat,
  Cpu,
  Truck,
  Plane,
  Stethoscope,
  GraduationCap,
  Landmark,
  MoreHorizontal,
  Filter,
  Download,
} from "lucide-react";
import Link from "next/link";

interface Entreprise {
  id: string;
  referenceSPI: string;
  denomination: string;
  sigle: string | null;
  description: string | null;
  secteurActivite: string;
  ville: string | null;
  region: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  nomContact: string | null;
  statut: string;
}

const SECTEURS = [
  { value: "AGRICULTURE", label: "Agriculture", icon: TreePine, color: "bg-green-100 text-green-700" },
  { value: "INDUSTRIE", label: "Industrie", icon: Factory, color: "bg-blue-100 text-blue-700" },
  { value: "SERVICES", label: "Services", icon: Briefcase, color: "bg-purple-100 text-purple-700" },
  { value: "COMMERCE", label: "Commerce", icon: Store, color: "bg-amber-100 text-amber-700" },
  { value: "CONSTRUCTION", label: "Construction", icon: HardHat, color: "bg-orange-100 text-orange-700" },
  { value: "TECHNOLOGIE", label: "Technologie", icon: Cpu, color: "bg-cyan-100 text-cyan-700" },
  { value: "TRANSPORT", label: "Transport", icon: Truck, color: "bg-rose-100 text-rose-700" },
  { value: "TOURISME", label: "Tourisme", icon: Plane, color: "bg-pink-100 text-pink-700" },
  { value: "SANTE", label: "Santé", icon: Stethoscope, color: "bg-red-100 text-red-700" },
  { value: "EDUCATION", label: "Éducation", icon: GraduationCap, color: "bg-indigo-100 text-indigo-700" },
  { value: "FINANCE", label: "Finance", icon: Landmark, color: "bg-emerald-100 text-emerald-700" },
  { value: "AUTRE", label: "Autre", icon: MoreHorizontal, color: "bg-gray-100 text-gray-700" },
];

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSecteur, setFilterSecteur] = useState<string>("");

  useEffect(() => {
    async function fetchEntreprises() {
      try {
        const res = await fetch("/api/entreprises");
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = await res.json();
        setEntreprises(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEntreprises();
  }, []);

  const getSecteurInfo = (secteur: string) => {
    return SECTEURS.find((s) => s.value === secteur) || SECTEURS[SECTEURS.length - 1];
  };

  const getSecteurCount = (secteur: string) => {
    return entreprises.filter((e) => e.secteurActivite === secteur).length;
  };

  const filteredEntreprises = entreprises.filter((e) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      e.denomination?.toLowerCase().includes(searchLower) ||
      e.sigle?.toLowerCase().includes(searchLower) ||
      e.description?.toLowerCase().includes(searchLower) ||
      e.ville?.toLowerCase().includes(searchLower);
    const matchSecteur = !filterSecteur || e.secteurActivite === filterSecteur;
    return matchSearch && matchSecteur;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des entreprises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Annuaire des entreprises</h1>
              <p className="text-gray-500">Entreprises répertoriées dans le portail SPI-CAM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Annuaire des Entreprises
          </h2>
          <p className="text-gray-500 mb-6">
            {entreprises.length} entreprises répertoriées
          </p>

          {/* Répartition par secteur */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">
              📊 RÉPARTITION PAR SECTEUR
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {SECTEURS.map((secteur) => {
                const count = getSecteurCount(secteur.value);
                const Icon = secteur.icon;
                return (
                  <div
                    key={secteur.value}
                    className={`bg-white rounded-lg border border-gray-200 p-4 text-center cursor-pointer transition-all hover:shadow-md ${
                      filterSecteur === secteur.value ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() =>
                      setFilterSecteur(filterSecteur === secteur.value ? "" : secteur.value)
                    }
                  >
                    <div className={`p-2 rounded-lg mb-2 inline-block ${secteur.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-gray-500">{secteur.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, sigle, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <select
              value={filterSecteur}
              onChange={(e) => setFilterSecteur(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Tous les secteurs</option>
              {SECTEURS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des entreprises */}
        <div className="space-y-4">
          {filteredEntreprises.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune entreprise trouvée</p>
            </div>
          ) : (
            filteredEntreprises.map((entreprise) => {
              const secteurInfo = getSecteurInfo(entreprise.secteurActivite);
              const SecteurIcon = secteurInfo.icon;
              return (
                <div
                  key={entreprise.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${secteurInfo.color}`}>
                          <SecteurIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entreprise.denomination}
                          </h3>
                          {entreprise.sigle && (
                            <span className="text-sm text-gray-500">({entreprise.sigle})</span>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entreprise.statut === "ACTIF"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {entreprise.statut}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        {entreprise.ville && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{entreprise.ville}{entreprise.region && `, ${entreprise.region}`}</span>
                          </div>
                        )}
                        {entreprise.telephone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{entreprise.telephone}</span>
                          </div>
                        )}
                        {entreprise.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{entreprise.email}</span>
                          </div>
                        )}
                      </div>
                      {entreprise.nomContact && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Contact: {entreprise.nomContact}
                        </p>
                      )}
                      {entreprise.adresse && (
                        <p className="text-sm text-gray-500 mt-1">
                          {entreprise.adresse}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {secteurInfo.label}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{entreprise.referenceSPI}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
