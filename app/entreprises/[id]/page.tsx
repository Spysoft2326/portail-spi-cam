"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Globe,
  ArrowLeft,
  Briefcase,
  Calendar,
  Tag,
  Activity,
  FileText,
  Loader2
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
  createdAt: string;
  updatedAt: string;
}

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
export default function EntrepriseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchEntreprise() {
      try {
        setLoading(true);
        const res = await fetch(`/api/entreprises/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Entreprise non trouvée");
          } else {
            setError("Erreur lors du chargement");
          }
          return;
        }
        const data = await res.json();
        setEntreprise(data);
      } catch (err) {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }

    fetchEntreprise();
  }, [id]);

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#007A3D] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement de l'entreprise...</p>
        </div>
      </div>
    );
  }

  // ─── ERROR ───
  if (error || !entreprise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="bg-[#007A3D] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/entreprises" className="inline-flex items-center gap-2 text-sm hover:underline">
              <ArrowLeft className="w-4 h-4" /> Retour à l'annuaire
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {error || "Entreprise introuvable"}
          </h2>
          <p className="text-gray-500 mb-6">
            L'entreprise demandée n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/entreprises"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'annuaire
          </Link>
        </div>
      </div>
    );
  }

  // ─── PAGE DÉTAIL ───
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
            href="/entreprises"
            className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'annuaire
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Bouton retour mobile */}
        <div className="mb-6 md:hidden">
          <Link
            href="/entreprises"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#007A3D] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'annuaire
          </Link>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-[#007A3D]/10 to-[#007A3D]/5 p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#007A3D] rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {entreprise.nom}
                    </h1>
                    {entreprise.sigle && (
                      <span className="text-lg text-gray-500">({entreprise.sigle})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {entreprise.secteurActivite && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${getSectorColor(entreprise.secteurActivite)}`}>
                        <Briefcase className="w-3.5 h-3.5" />
                        {entreprise.secteurActivite}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${
                      entreprise.statut === "ACTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      <Activity className="w-3.5 h-3.5" />
                      {entreprise.statut}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-mono bg-white/80 px-3 py-1 rounded-lg">
                {entreprise.id}
              </span>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Colonne gauche : Informations */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#007A3D]" />
                  Informations générales
                </h2>

                {entreprise.description && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">{entreprise.description}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Localisation */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#007A3D]/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#007A3D]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Localisation</p>
                      <p className="text-sm text-gray-600">
                        {entreprise.adresse || "Adresse non renseignée"}
                      </p>
                      {(entreprise.ville || entreprise.region) && (
                        <p className="text-sm text-gray-500 mt-1">
                          {entreprise.ville}{entreprise.ville && entreprise.region ? ", " : ""}{entreprise.region}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact téléphone */}
                  {entreprise.telephone && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#007A3D]/10 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-[#007A3D]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Téléphone</p>
                        <a href={`tel:${entreprise.telephone}`} className="text-sm text-[#007A3D] hover:underline">
                          {entreprise.telephone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Contact email */}
                  {entreprise.email && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#007A3D]/10 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-[#007A3D]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <a href={`mailto:${entreprise.email}`} className="text-sm text-[#007A3D] hover:underline">
                          {entreprise.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Contact personne */}
                  {entreprise.nomContact && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#007A3D]/10 rounded-lg flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-[#007A3D]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact</p>
                        <p className="text-sm text-gray-600">{entreprise.nomContact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite : Métadonnées */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#007A3D]" />
                  Métadonnées
                </h2>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Identifiant</span>
                    <span className="text-sm font-mono text-gray-700">{entreprise.id}</span>
                  </div>

                  <div className="border-t border-gray-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Statut</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      entreprise.statut === "ACTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {entreprise.statut}
                    </span>
                  </div>

                  {entreprise.secteurActivite && (
                    <>
                      <div className="border-t border-gray-200" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Secteur</span>
                        <span className="text-sm font-medium text-gray-700">{entreprise.secteurActivite}</span>
                      </div>
                    </>
                  )}

                  {(entreprise.ville || entreprise.region) && (
                    <>
                      <div className="border-t border-gray-200" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Région</span>
                        <span className="text-sm font-medium text-gray-700">{entreprise.region || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Ville</span>
                        <span className="text-sm font-medium text-gray-700">{entreprise.ville || "-"}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Créé le
                    </span>
                    <span className="text-sm text-gray-700">
                      {new Date(entreprise.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Modifié le
                    </span>
                    <span className="text-sm text-gray-700">
                      {new Date(entreprise.updatedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Bouton retour */}
                <Link
                  href="/entreprises"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#007A3D] text-white rounded-xl hover:bg-[#006633] transition font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour à l'annuaire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-[#007A3D]" />
            <span className="font-bold">Portail SPI Cam</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Portail SPI Cam - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
