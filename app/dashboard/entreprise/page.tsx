"use client";

import { useState, useEffect } from "react";

interface Entreprise {
  id: string;
  referenceSPI: string;
  denomination: string;
  sigle: string | null;
  formeJuridique: string | null;
  capitalSocial: number | null;
  adresse: string | null;
  ville: string | null;
  departement: string | null;
  region: string;
  telephone: string | null;
  email: string | null;
  siteWeb: string | null;
  secteurActivite: string;
  sousSecteur: string | null;
  produitsPrincipaux: string | null;
  statut: string;
  estExportateur: boolean;
  estDansZoneIndustrielle: boolean;
  nomZoneIndustrielle: string | null;
}

export default function EntrepriseDashboard() {
  const [entreprise, setEntreprise] = useState(null as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/entreprise/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.entreprise) {
          setEntreprise(data.entreprise);
        } else {
          setError(data.error || "Aucune entreprise liée à ce compte");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !entreprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Aucune entreprise trouvée"}</p>
          <p className="text-gray-500 mt-2">Contactez l'administrateur pour associer votre compte.</p>
        </div>
      </div>
    );
  }

  const e = entreprise as Entreprise;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header harmonisé avec le dashboard */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Espace Entreprise</h1>
              <p className="text-blue-200 mt-1">{e.denomination}</p>
            </div>
            <a
              href="/dashboard/super-admin"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
            >
              📊 Tableau de bord
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Référence SPI</span>
              <p className="font-medium text-gray-900">{e.referenceSPI}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">N° Contribuable</span>
              <p className="font-medium text-gray-900">{e.numContribuable || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Secteur</span>
              <p className="font-medium text-gray-900">{e.secteurActivite}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Région</span>
              <p className="font-medium text-gray-900">{e.region}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Ville</span>
              <p className="font-medium text-gray-900">{e.ville || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Téléphone</span>
              <p className="font-medium text-gray-900">{e.telephone || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p className="font-medium text-gray-900">{e.email || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Site web</span>
              <p className="font-medium text-gray-900">{e.siteWeb || "—"}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <span className="text-sm text-gray-500">Produits principaux</span>
            <p className="mt-1 text-gray-900">{e.produitsPrincipaux || "—"}</p>
          </div>

          <div className="pt-4 border-t flex gap-4">
            <span className={`px-3 py-1 rounded-full text-sm ${e.estExportateur ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
              {e.estExportateur ? "✅ Exportateur" : "❌ Non exportateur"}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${e.estDansZoneIndustrielle ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
              {e.estDansZoneIndustrielle ? "🏭 Zone industrielle" : "🏭 Hors zone"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
