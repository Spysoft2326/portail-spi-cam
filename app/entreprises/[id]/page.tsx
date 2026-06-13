"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, MapPin, Globe, Phone, Mail, User,
  Factory, Shield, TrendingUp
} from "lucide-react";

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
  nomContact: string | null;  // ← AJOUTÉ
  siteWeb: string | null;
  numContribuable: string | null;
  secteurActivite: string;
  sousSecteur: string | null;
  produitsPrincipaux: string | null;
  statut: string;
  estExportateur: boolean;
  estDansZoneIndustrielle: boolean;
  nomZoneIndustrielle: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Production {
  id: string;
  annee: number;
  trimestre: string;
  productionPhysique: number | null;
  chiffreAffaires: number | null;
  effectifs: number | null;
  investissements: number | null;
  statut: string;
}

export default function EntrepriseDetailPage() {
  const params = useParams();
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEntreprise();
  }, [params.id]);

  const fetchEntreprise = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/entreprises/detail?id=${params.id}`);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setEntreprise(data.entreprise);
      setProductions(data.productions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !entreprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Entreprise non trouvee"}</p>
          <Link
            href="/entreprises"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'annuaire
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/entreprises"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'annuaire
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{entreprise.denomination}</h1>
                  {entreprise.sigle && (
                    <p className="text-lg text-gray-500">{entreprise.sigle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {entreprise.secteurActivite}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  entreprise.statut === "ACTIF" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {entreprise.statut}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Reference SPI</p>
              <p className="text-lg font-mono font-bold text-gray-900">{entreprise.referenceSPI}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations generales */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Informations generales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entreprise.formeJuridique && (
                  <div>
                    <p className="text-sm text-gray-500">Forme juridique</p>
                    <p className="font-medium text-gray-900">{entreprise.formeJuridique}</p>
                  </div>
                )}
                {entreprise.capitalSocial && (
                  <div>
                    <p className="text-sm text-gray-500">Capital social</p>
                    <p className="font-medium text-gray-900">{entreprise.capitalSocial.toLocaleString()} F CFA</p>
                  </div>
                )}
                {entreprise.numContribuable && (
                  <div>
                    <p className="text-sm text-gray-500">N Contribuable</p>
                    <p className="font-medium text-gray-900">{entreprise.numContribuable}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Date d'inscription</p>
                  <p className="font-medium text-gray-900">
                    {new Date(entreprise.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              {entreprise.produitsPrincipaux && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Produits principaux</p>
                  <p className="text-gray-900">{entreprise.produitsPrincipaux}</p>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Contact
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="text-gray-900">
                      {entreprise.adresse || "Non renseignee"}
                      {entreprise.ville && <>, {entreprise.ville}</>}
                      {entreprise.departement && <>, {entreprise.departement}</>}
                      {entreprise.region && <>, {entreprise.region}</>}
                    </p>
                  </div>
                </div>

                {/* ← AJOUTÉ : Nom du contact */}
                {entreprise.nomContact && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact / Responsable</p>
                      <p className="text-gray-900 font-medium">{entreprise.nomContact}</p>
                    </div>
                  </div>
                )}

                {entreprise.telephone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Telephone</p>
                      <p className="text-gray-900">{entreprise.telephone}</p>
                    </div>
                  </div>
                )}

                {entreprise.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${entreprise.email}`} className="text-blue-600 hover:underline">
                        {entreprise.email}
                      </a>
                    </div>
                  </div>
                )}

                {entreprise.siteWeb && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Site Web</p>
                      <a href={entreprise.siteWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {entreprise.siteWeb}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Productions */}
            {productions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-orange-600" />
                  Productions ({productions.length})
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Production</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (F CFA)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Effectifs</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {productions.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {p.annee} - {p.trimestre}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {p.productionPhysique?.toLocaleString() || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {p.chiffreAffaires?.toLocaleString() || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {p.effectifs?.toLocaleString() || "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              p.statut === "VALIDEE" ? "bg-green-100 text-green-700" :
                              p.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {p.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Exportateur
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entreprise.estExportateur ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {entreprise.estExportateur ? "Oui" : "Non"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Factory className="w-4 h-4" />
                    Zone industrielle
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entreprise.estDansZoneIndustrielle ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {entreprise.estDansZoneIndustrielle ? "Oui" : "Non"}
                  </span>
                </div>

                {entreprise.nomZoneIndustrielle && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Zone</p>
                    <p className="font-medium text-gray-900">{entreprise.nomZoneIndustrielle}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-2">
                <Link
                  href="/entreprises"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour a l'annuaire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
