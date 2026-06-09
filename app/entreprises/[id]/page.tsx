"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, MapPin, Globe, ArrowLeft, Mail, Phone, Users, TrendingUp, Calendar } from "lucide-react";

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
  description: string | null;
  dateCreation: string | null;
  effectif: number | null;
  chiffreAffaire: number | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
}

interface Production {
  id: string;
  annee: number;
  trimestre: number;
  valeur: number;
  unite: string;
  statut: string;
}

export default function EntrepriseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
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
      // Utiliser l'API publique
      const res = await fetch(`/api/public/entreprises/${id}`);
      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      setEntreprise(data.entreprise || null);
      setProductions(data.productions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <p className="text-red-600 mb-4">{error || "Entreprise non trouvée"}</p>
          <Link href="/entreprises" className="text-blue-600 hover:underline">
            Retour à l'annuaire
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
          <Link
            href="/entreprises"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'annuaire
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSectorColor(entreprise.secteurActivite)}`}>
                {entreprise.secteurActivite}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{entreprise.denomination}</h1>
              {entreprise.sigle && <p className="text-gray-500">{entreprise.sigle}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {entreprise.description && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <p className="text-gray-600">{entreprise.description}</p>
              </div>
            )}

            {/* Produits */}
            {entreprise.produitsPrincipaux && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Produits et services</h2>
                <p className="text-gray-600">{entreprise.produitsPrincipaux}</p>
              </div>
            )}

            {/* Productions */}
            {productions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Données de production</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Année</th>
                        <th className="text-left py-2 px-4">Trimestre</th>
                        <th className="text-right py-2 px-4">Valeur</th>
                        <th className="text-left py-2 px-4">Unité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productions.map((p) => (
                        <tr key={p.id} className="border-b">
                          <td className="py-2 px-4">{p.annee}</td>
                          <td className="py-2 px-4">T{p.trimestre}</td>
                          <td className="py-2 px-4 text-right">{p.valeur.toLocaleString()}</td>
                          <td className="py-2 px-4">{p.unite}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar informations */}
          <div className="space-y-6">
            {/* Coordonnées */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Coordonnées</h2>
              <div className="space-y-3">
                {entreprise.adresse && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">{entreprise.adresse}</p>
                      <p className="text-sm text-gray-500">{entreprise.ville}, {entreprise.region}</p>
                    </div>
                  </div>
                )}

                {entreprise.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${entreprise.email}`} className="text-sm text-blue-600 hover:underline">
                      {entreprise.email}
                    </a>
                  </div>
                )}

                {entreprise.telephone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${entreprise.telephone}`} className="text-sm text-blue-600 hover:underline">
                      {entreprise.telephone}
                    </a>
                  </div>
                )}

                {entreprise.siteWeb && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a href={entreprise.siteWeb} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      {entreprise.siteWeb}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Informations clés */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Informations clés</h2>
              <div className="space-y-3">
                {entreprise.dateCreation && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Date de création</p>
                      <p className="text-sm">{new Date(entreprise.dateCreation).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                )}

                {entreprise.effectif && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Effectif</p>
                      <p className="text-sm">{entreprise.effectif.toLocaleString()} employés</p>
                    </div>
                  </div>
                )}

                {entreprise.chiffreAffaire && (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Chiffre d'affaires</p>
                      <p className="text-sm">{entreprise.chiffreAffaire.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
