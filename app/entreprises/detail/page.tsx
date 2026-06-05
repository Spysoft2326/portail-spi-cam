"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProductionData {
  id: string;
  annee: number;
  periode: string;
  volumeProduit: number | null;
  valeurProduction: number | null;
  chiffreAffaires: number | null;
  nombreEmployes: number | null;
  statutValidation: string;
}

interface Document {
  id: string;
  nomFichier: string;
  typeDocument: string;
  url: string;
  uploadedAt: string;
}

interface Entreprise {
  id: string;
  referenceSPI: string;
  denomination: string;
  sigle: string | null;
  formeJuridique: string | null;
  capitalSocial: number | null;
  dateCreation: string | null;
  numRegistreCommerce: string | null;
  numContribuable: string | null;
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
  createdAt: string;
  productions: ProductionData[];
  documents: Document[];
}

export default function EntrepriseDetailPage() {
  const params = useParams();
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const res = await fetch(`/api/entreprises/detail/${params.id}`);
        if (!res.ok) throw new Error("Entreprise non trouvée");
        const data = await res.json();
        setEntreprise(data.entreprise);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchEntreprise();
  }, [params.id]);

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
          <p className="text-red-600 text-lg">{error || "Entreprise non trouvée"}</p>
          <Link
            href="/entreprises"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const e = entreprise;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/entreprises"
            className="text-blue-200 hover:text-white text-sm mb-4 inline-block"
          >
            ← Retour à l'annuaire
          </Link>
          <h1 className="text-3xl font-bold">{e.denomination}</h1>
          {e.sigle && <p className="text-blue-200 text-lg mt-1">{e.sigle}</p>}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {e.secteurActivite}
            </span>
            <span>📍 {e.ville || "N/A"}, {e.region}</span>
            <span className={`px-3 py-1 rounded-full ${e.statut === "ACTIF" ? "bg-green-400/30" : "bg-red-400/30"}`}>
              {e.statut}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identité */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏢 Informations générales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Référence SPI" value={e.referenceSPI} />
                <InfoItem label="Forme juridique" value={e.formeJuridique} />
                <InfoItem label="Capital social" value={e.capitalSocial ? `${e.capitalSocial.toLocaleString()} FCFA` : null} />
                <InfoItem label="Date de création" value={e.dateCreation ? new Date(e.dateCreation).toLocaleDateString("fr-FR") : null} />
                <InfoItem label="N° RCCM" value={e.numRegistreCommerce} />
                <InfoItem label="N° Contribuable" value={e.numContribuable} />
                <InfoItem label="Sous-secteur" value={e.sousSecteur} />
                <InfoItem label="Zone industrielle" value={e.estDansZoneIndustrielle ? e.nomZoneIndustrielle : "Non"} />
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📞 Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Adresse" value={e.adresse} />
                <InfoItem label="Ville" value={e.ville} />
                <InfoItem label="Département" value={e.departement} />
                <InfoItem label="Région" value={e.region} />
                <InfoItem label="Téléphone" value={e.telephone} />
                <InfoItem label="Email" value={e.email} />
                {e.siteWeb && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">Site web</span>
                    <a
                      href={`https://${e.siteWeb}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      🌐 {e.siteWeb}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Activité */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ⚙️ Activité
              </h2>
              <InfoItem label="Produits principaux" value={e.produitsPrincipaux} />
              <div className="flex gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${e.estExportateur ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {e.estExportateur ? "✅ Exportateur" : "❌ Non exportateur"}
                </span>
              </div>
            </div>

            {/* Données de production */}
            {e.productions && e.productions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📊 Dernières données de production
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Année</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Volume</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valeur</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">CA</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Emplois</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {e.productions.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2">{p.annee}</td>
                          <td className="px-4 py-2">{p.periode}</td>
                          <td className="px-4 py-2 text-right">{p.volumeProduit?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-2 text-right">{p.valeurProduction?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-2 text-right">{p.chiffreAffaires?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-2 text-right">{p.nombreEmployes || "-"}</td>
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
            {/* Résumé */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Secteur</span>
                  <span className="font-medium">{e.secteurActivite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Région</span>
                  <span className="font-medium">{e.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ville</span>
                  <span className="font-medium">{e.ville || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut</span>
                  <span className={`font-medium ${e.statut === "ACTIF" ? "text-green-600" : "text-red-600"}`}>
                    {e.statut}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents */}
            {e.documents && e.documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">📄 Documents</h3>
                <div className="space-y-2">
                  {e.documents.map((d) => (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      <div className="font-medium text-gray-900">{d.nomFichier}</div>
                      <div className="text-gray-500">{d.typeDocument}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-sm text-gray-500 block">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
