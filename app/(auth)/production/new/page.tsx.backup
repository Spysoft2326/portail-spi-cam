"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Plus, Loader2, Save, Calendar,
  Package, Users, DollarSign, TrendingUp, AlertCircle,
  ClipboardList
} from "lucide-react";

interface Enterprise {
  id: string;
  denomination: string;
  referenceSPI: string;
  secteurActivite: string;
}

export default function NewProductionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    entrepriseId: "",
    isNewEnterprise: false,
    newDenomination: "",
    newSigle: "",
    newSecteur: "Commerce",
    newVille: "",
    newRegion: "Centre",
    annee: new Date().getFullYear(),
    trimestre: 1,
    productionPhysique: "",
    chiffreAffaires: "",
    effectifs: "",
    investissements: "",
    commentaire: "",
  });

  useEffect(() => {
    fetchEnterprises();
  }, []);

  const fetchEnterprises = async () => {
    try {
      const res = await fetch("/api/entreprises?limit=1000");
      if (!res.ok) throw new Error("Erreur chargement entreprises");
      const data = await res.json();
      setEnterprises(data.entreprises || []);
    } catch (err: any) {
      console.error("Erreur:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalEntrepriseId = formData.entrepriseId;

      // Créer nouvelle entreprise si nécessaire
      if (formData.isNewEnterprise) {
        const entRes = await fetch("/api/entreprises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            denomination: formData.newDenomination,
            sigle: formData.newSigle,
            secteurActivite: formData.newSecteur,
            ville: formData.newVille,
            region: formData.newRegion,
          }),
        });
        if (!entRes.ok) throw new Error("Erreur création entreprise");
        const newEnt = await entRes.json();
        finalEntrepriseId = newEnt.id;
      }

      // Créer la production
      const res = await fetch("/api/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrepriseId: finalEntrepriseId,
          annee: formData.annee,
          trimestre: formData.trimestre,
          productionPhysique: formData.productionPhysique ? parseFloat(formData.productionPhysique) : null,
          chiffreAffaires: formData.chiffreAffaires ? parseFloat(formData.chiffreAffaires) : null,
          effectifs: formData.effectifs ? parseInt(formData.effectifs) : null,
          investissements: formData.investissements ? parseFloat(formData.investissements) : null,
          commentaire: formData.commentaire,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la sauvegarde");
      }

      router.push("/dashboard/production");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header harmonisé */}
      <div className="mb-6">
        <Link href="/dashboard/production" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition">
          <ArrowLeft className="w-4 h-4" />
          Retour aux productions
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle saisie</h1>
            <p className="text-sm text-gray-500">Production trimestrielle</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Entreprise */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Entreprise
          </h2>

          <div className="space-y-4">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!formData.isNewEnterprise} onChange={() => setFormData({ ...formData, isNewEnterprise: false })} className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Entreprise existante</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={formData.isNewEnterprise} onChange={() => setFormData({ ...formData, isNewEnterprise: true })} className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Nouvelle entreprise</span>
              </label>
            </div>

            {!formData.isNewEnterprise ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionner une entreprise *</label>
                <select value={formData.entrepriseId} onChange={(e) => setFormData({ ...formData, entrepriseId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" required={!formData.isNewEnterprise}>
                  <option value="">Choisir...</option>
                  {enterprises.map((e) => (
                    <option key={e.id} value={e.id}>{e.denomination} ({e.referenceSPI})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dénomination *</label>
                  <input type="text" value={formData.newDenomination} onChange={(e) => setFormData({ ...formData, newDenomination: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required={formData.isNewEnterprise} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sigle</label>
                  <input type="text" value={formData.newSigle} onChange={(e) => setFormData({ ...formData, newSigle: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                  <select value={formData.newSecteur} onChange={(e) => setFormData({ ...formData, newSecteur: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="Commerce">Commerce</option>
                    <option value="Agriculture / Agro-industrie">Agriculture</option>
                    <option value="BTP / Matériaux">BTP / Matériaux</option>
                    <option value="Télécommunications / IT">Télécommunications</option>
                    <option value="Transport / Logistique">Transport</option>
                    <option value="Énergie">Énergie</option>
                    <option value="Métallurgie">Métallurgie</option>
                    <option value="Finance">Finance</option>
                    <option value="Pharmaceutique">Pharmaceutique</option>
                    <option value="Industrie légère">Industrie légère</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input type="text" value={formData.newVille} onChange={(e) => setFormData({ ...formData, newVille: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Période */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Période
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année *</label>
              <input type="number" value={formData.annee} onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre *</label>
              <select value={formData.trimestre} onChange={(e) => setFormData({ ...formData, trimestre: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" required>
                <option value={1}>T1 (Janvier - Mars)</option>
                <option value={2}>T2 (Avril - Juin)</option>
                <option value={3}>T3 (Juillet - Septembre)</option>
                <option value={4}>T4 (Octobre - Décembre)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Données de production */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Données de production
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Production physique (tonnes/unités)</label>
              <input type="number" step="0.01" value={formData.productionPhysique} onChange={(e) => setFormData({ ...formData, productionPhysique: e.target.value })} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chiffre d'affaires (FCFA)</label>
              <input type="number" step="0.01" value={formData.chiffreAffaires} onChange={(e) => setFormData({ ...formData, chiffreAffaires: e.target.value })} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effectifs</label>
              <input type="number" value={formData.effectifs} onChange={(e) => setFormData({ ...formData, effectifs: e.target.value })} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investissements (FCFA)</label>
              <input type="number" step="0.01" value={formData.investissements} onChange={(e) => setFormData({ ...formData, investissements: e.target.value })} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea value={formData.commentaire} onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })} placeholder="Observations, notes..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="button" onClick={() => router.push("/dashboard/production")} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition" disabled={loading}>
            Annuler
          </button>
          <button type="submit" className="px-6 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center gap-2 disabled:opacity-50" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer la saisie
          </button>
        </div>
      </form>
    </div>
  );
}
