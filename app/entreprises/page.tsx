"use client";

import { useState, useEffect } from "react";
import { Building2, Search, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Entreprise {
  id: string;
  referenceSPI: string;
  denomination: string;
  sigle: string | null;
  ville: string | null;
  secteurActivite: string;
  telephone: string | null;
  email: string | null;
  nomContact: string | null;
  statut: string;
}

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [secteurFilter, setSecteurFilter] = useState("");

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

  const filteredEntreprises = entreprises.filter((e) => {
    const matchSearch =
      !searchTerm ||
      e.denomination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sigle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ville?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSecteur = !secteurFilter || e.secteurActivite === secteurFilter;
    return matchSearch && matchSecteur;
  });

  const secteurs = Array.from(new Set(entreprises.map((e) => e.secteurActivite)));

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
            <Building2 className="h-8 w-8 text-blue-600" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {secteurs.map((secteur) => {
                const count = entreprises.filter((e) => e.secteurActivite === secteur).length;
                return (
                  <div
                    key={secteur}
                    className="bg-white rounded-lg p-4 border border-gray-200 text-center"
                  >
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{secteur}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtres
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
              <input
                type="text"
                placeholder="Nom, sigle, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
              <select
                value={secteurFilter}
                onChange={(e) => setSecteurFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Tous les secteurs</option>
                {secteurs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
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
            filteredEntreprises.map((entreprise) => (
              <div
                key={entreprise.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entreprise.denomination}
                      </h3>
                      {entreprise.sigle && (
                        <span className="text-sm text-gray-500">({entreprise.sigle})</span>
                      )}
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
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {entreprise.ville && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{entreprise.ville}</span>
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
                      <p className="text-sm text-gray-500 mt-2">
                        Contact: {entreprise.nomContact}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {entreprise.secteurActivite}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
