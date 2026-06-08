"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface Production {
  id: string;
  annee: number;
  trimestre: number;
  productionPhysique: number | null;
  chiffreAffaires: number | null;
  effectifs: number | null;
  investissements: number | null;
  statut: string;
  commentaire: string | null;
  dateSaisie: string;
  dateValidation: string | null;
  saisiePar: string;
  validePar: string | null;
  entreprise: {
    id: string;
    denomination: string;
    referenceSPI: string;
    secteurActivite: string;
    region: string;
  };
}

export default function ProductionDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [production, setProduction] = useState<Production | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [commentaireValidation, setCommentaireValidation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "");
  const isOwner = production?.saisiePar === session?.user?.id;
  const canEdit = isAdmin || (isOwner && production?.statut !== "VALIDEE");

  useEffect(() => {
    fetchProduction();
  }, [params.id]);

  const fetchProduction = async () => {
    try {
      const res = await fetch(`/api/production/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setProduction(data.production);
      } else {
        setError(data.error || "Production non trouvée");
      }
    } catch (err) {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (action: "VALIDEE" | "REJETEE") => {
    setValidating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionId: params.id,
          action,
          commentaireValidation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de validation");
      } else {
        setSuccess(
          action === "VALIDEE"
            ? "Production validée avec succès !"
            : "Production rejetée."
        );
        fetchProduction();
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setValidating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cette production ?")) return;

    try {
      const res = await fetch(`/api/production/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/production");
      } else {
        const data = await res.json();
        setError(data.error || "Erreur de suppression");
      }
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "VALIDEE":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            Validée
          </span>
        );
      case "REJETEE":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700">
            <XCircle className="w-4 h-4" />
            Rejetée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
            <Clock className="w-4 h-4" />
            En attente de validation
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#007A3D]" />
      </div>
    );
  }

  if (!production) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{error || "Production non trouvée"}</p>
        <Link href="/production" className="text-[#007A3D] hover:text-[#006633] text-sm mt-2 inline-block">
          ← Retour aux productions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/production" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              T{production.trimestre} {production.annee}
            </h1>
            <p className="text-sm text-gray-500">
              {production.entreprise.denomination}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatutBadge(production.statut)}
          {canEdit && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Données */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entreprise */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#007A3D]" />
              Entreprise
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Dénomination</p>
                <p className="font-medium text-gray-900">{production.entreprise.denomination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Référence SPI</p>
                <p className="font-medium text-gray-900">{production.entreprise.referenceSPI}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Secteur</p>
                <p className="font-medium text-gray-900">{production.entreprise.secteurActivite}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Région</p>
                <p className="font-medium text-gray-900">{production.entreprise.region}</p>
              </div>
            </div>
          </div>

          {/* Production */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#007A3D]" />
              Données de production
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Production physique</p>
                <p className="text-2xl font-bold text-gray-900">
                  {production.productionPhysique?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-gray-400">tonnes / unités</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900">
                  {production.chiffreAffaires
                    ? `${production.chiffreAffaires.toLocaleString()} F`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400">FCFA</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Effectifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {production.effectifs?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-gray-400">salariés</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Investissements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {production.investissements
                    ? `${production.investissements.toLocaleString()} F`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400">FCFA</p>
              </div>
            </div>
            {production.commentaire && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Commentaire</p>
                <p className="text-gray-900">{production.commentaire}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Validation */}
        <div className="space-y-6">
          {/* Info saisie */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Saisie le</span>
                <span className="text-gray-900">
                  {new Date(production.dateSaisie).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {production.dateValidation && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Validée le</span>
                  <span className="text-gray-900">
                    {new Date(production.dateValidation).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Validation (Admin uniquement) */}
          {isAdmin && production.statut === "EN_ATTENTE" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#007A3D]" />
                Validation
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={commentaireValidation}
                    onChange={(e) => setCommentaireValidation(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none text-sm"
                    placeholder="Remarques sur la validation..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleValidation("VALIDEE")}
                    disabled={validating}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {validating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Valider
                  </button>
                  <button
                    onClick={() => handleValidation("REJETEE")}
                    disabled={validating}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {validating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {canEdit && production.statut === "EN_ATTENTE" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <Link
                href={`/production/${params.id}/edit`}
                className="block w-full text-center px-4 py-2.5 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition-colors font-medium"
              >
                Modifier la saisie
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
