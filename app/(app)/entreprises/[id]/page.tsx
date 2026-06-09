"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Factory,
  TrendingUp,
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
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
  trimestre: number;
  productionPhysique: number | null;
  chiffreAffaires: number | null;
  effectifs: number | null;
  investissements: number | null;
  statut: string;
}

export default function EntrepriseDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [entreprise, setEntreprise] = useState<<Entreprise | null>(null);
  const [productions, setProductions] = useState<<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchEntreprise();
    }
  }, [id]);

  const fetchEntreprise = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/entreprises/detail?id=${id}`);
      if (!res.ok) throw new Error("Entreprise non trouvee");

      const data = await res.json();
      setEntreprise(data.entreprise);
      setProductions(data.productions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "ACTIF": return "bg-green-100 text-green-800";
      case "INACTIF": return "bg-gray-100 text-gray-800";
      case "SUSPENDU": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProductionStatutColor = (statut: string) => {
    switch (statut) {
      case "VALIDEE": return "bg-green-100 text-green-800";
      case "EN_ATTENTE": return "bg-amber-100 text-amber-800";
      case "REJETEE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'entreprise...</p>
        </div>
      </div>
    );
  }

  if (error || !entreprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Entreprise non trouvee"}</p>
          <Link
            href="/entreprises"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/entreprises"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{entreprise.denomination}</h1>
              </div>
              {entreprise.sigle && (
                <p className="text-lg text-gray-500 mb-2">{entreprise.sigle}</p>
              )}
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(entreprise.statut)}`}>
                  {entreprise.statut}
                </span>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {entreprise.secteurActivite}
                </span>
                {entreprise.estExportateur && (
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Exportateur
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Reference SPI</div>
              <div className="font-mono font-semibold text-gray-900">{entreprise.referenceSPI}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations generales */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Informations generales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Forme juridique</label>
                  <div className="text-gray-900">{entreprise.formeJuridique || "Non specifie"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Capital social</label>
                  <div className="text-gray-900">
                    {entreprise.capitalSocial ? `${entreprise.capitalSocial.toLocaleString()} FCFA` : "Non specifie"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Numero contribuable</label>
                  <div className="text-gray-900">{entreprise.numContribuable || "Non specifie"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Sous-secteur</label>
                  <div className="text-gray-900">{entreprise.sousSecteur || "Non specifie"}</div>
                </div>
              </div>
              {entreprise.produitsPrincipaux && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Produits principaux</label>
                  <div className="text-gray-900">{entreprise.produitsPrincipaux}</div>
                </div>
              )}
            </div>

            {/* Coordonnees */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Coordonnees
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Adresse</div>
                    <div className="text-gray-500">{entreprise.adresse || "Non specifie"}</div>
                    <div className="text-gray-500">{entreprise.ville || "Non specifie"}, {entreprise.departement || ""}</div>
                    <div className="text-gray-900 font-medium">{entreprise.region}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {entreprise.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Telephone</div>
                        <div className="text-gray-500">{entreprise.telephone}</div>
                      </div>
                    </div>
                  )}
                  {entreprise.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-gray-500">{entreprise.email}</div>
                      </div>
                    </div>
                  )}
                  {entreprise.siteWeb && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Site web</div>
                        <a href={entreprise.siteWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition">
                          {entreprise.siteWeb}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Production */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-600" />
                Donnees de production
              </h2>
              {productions.length === 0 ? (
                <div className="text-center py-8">
                  <Factory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune donnee de production disponible</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Production</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (M FCFA)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Effectifs</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invest.</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {productions.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium">{prod.annee} T{prod.trimestre}</td>
                          <td className="px-4 py-3 text-right">{prod.productionPhysique?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-3 text-right">{prod.chiffreAffaires?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-3 text-right">{prod.effectifs?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-3 text-right">{prod.investissements?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getProductionStatutColor(prod.statut)}`}>
                              {prod.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Colonne laterale */}
          <div className="space-y-6">
            {/* Carte info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resume</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Zone industrielle</span>
                  <span className={`text-sm font-medium ${entreprise.estDansZoneIndustrielle ? "text-green-600" : "text-gray-500"}`}>
                    {entreprise.estDansZoneIndustrielle ? "Oui" : "Non"}
                  </span>
                </div>
                {entreprise.estDansZoneIndustrielle && entreprise.nomZoneIndustrielle && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Nom de la zone</span>
                    <span className="text-sm font-medium text-gray-900">{entreprise.nomZoneIndustrielle}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Exportateur</span>
                  <span className={`text-sm font-medium ${entreprise.estExportateur ? "text-green-600" : "text-gray-500"}`}>
                    {entreprise.estExportateur ? "Oui" : "Non"}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Cree le</span>
                    <span className="text-sm text-gray-900">{new Date(entreprise.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Modifie le</span>
                    <span className="text-sm text-gray-900">{new Date(entreprise.updatedAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Ajouter une production
                </button>
                <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Modifier l'entreprise
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}