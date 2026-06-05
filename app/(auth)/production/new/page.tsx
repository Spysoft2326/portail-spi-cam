"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Entreprise {
  id: string;
  denomination: string;
  referenceSPI: string;
}

export default function SaisieProductionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);

  const [formData, setFormData] = useState({
    entrepriseId: "",
    annee: 2026,
    periode: "TRIMESTRIEL",
    trimestre: 1,
    semestre: 1,
    volumeProduit: "",
    uniteMesure: "tonnes",
    valeurProduction: "",
    chiffreAffaires: "",
    nombreEmployes: "",
    nombreEmployesTemporaires: "",
    capaciteInstallee: "",
    capaciteUtilisee: "",
    tauxQualite: "",
    tauxDisponibilite: "",
    volumeExport: "",
    valeurExport: "",
    paysDestination: "",
    matieresPremieresLocal: "",
    matieresPremieresImport: "",
    sourceDonnee: "Déclaration entreprise",
    methodeCollecte: "Questionnaire en ligne",
  });

  useEffect(() => {
    async function fetchEntreprises() {
      try {
        const res = await fetch("/api/entreprises?limit=100");
        const data = await res.json();
        setEntreprises(data.entreprises || []);
      } catch {
        console.error("Erreur chargement entreprises");
      }
    }
    fetchEntreprises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        annee: parseInt(formData.annee.toString()),
        trimestre: formData.periode === "TRIMESTRIEL" ? parseInt(formData.trimestre.toString()) : undefined,
        semestre: formData.periode === "SEMESTRIEL" ? parseInt(formData.semestre.toString()) : undefined,
        volumeProduit: formData.volumeProduit ? parseFloat(formData.volumeProduit) : undefined,
        valeurProduction: formData.valeurProduction ? parseFloat(formData.valeurProduction) : undefined,
        chiffreAffaires: formData.chiffreAffaires ? parseFloat(formData.chiffreAffaires) : undefined,
        nombreEmployes: formData.nombreEmployes ? parseInt(formData.nombreEmployes) : undefined,
        nombreEmployesTemporaires: formData.nombreEmployesTemporaires ? parseInt(formData.nombreEmployesTemporaires) : undefined,
        capaciteInstallee: formData.capaciteInstallee ? parseFloat(formData.capaciteInstallee) : undefined,
        capaciteUtilisee: formData.capaciteUtilisee ? parseFloat(formData.capaciteUtilisee) : undefined,
        tauxQualite: formData.tauxQualite ? parseFloat(formData.tauxQualite) : undefined,
        tauxDisponibilite: formData.tauxDisponibilite ? parseFloat(formData.tauxDisponibilite) : undefined,
        volumeExport: formData.volumeExport ? parseFloat(formData.volumeExport) : undefined,
        valeurExport: formData.valeurExport ? parseFloat(formData.valeurExport) : undefined,
        matieresPremieresLocal: formData.matieresPremieresLocal ? parseFloat(formData.matieresPremieresLocal) : undefined,
        matieresPremieresImport: formData.matieresPremieresImport ? parseFloat(formData.matieresPremieresImport) : undefined,
      };

      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setSuccess(true);
      setFormData({
        ...formData,
        entrepriseId: "",
        volumeProduit: "",
        valeurProduction: "",
        chiffreAffaires: "",
        nombreEmployes: "",
        nombreEmployesTemporaires: "",
        capaciteInstallee: "",
        capaciteUtilisee: "",
        tauxQualite: "",
        tauxDisponibilite: "",
        volumeExport: "",
        valeurExport: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agent" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nouvelle saisie de production</h2>
          <p className="text-sm text-gray-500">Agent : {session?.user?.name}</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="w-5 h-5" />
          Donnée de production enregistrée avec succès ! En attente de validation.
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Entreprise et Période */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entreprise *
            </label>
            <select
              required
              value={formData.entrepriseId}
              onChange={(e) => setFormData({ ...formData, entrepriseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
            >
              <option value="">Sélectionner...</option>
              {entreprises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.denomination}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année *
            </label>
            <input
              type="number"
              required
              value={formData.annee}
              onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Période *
            </label>
            <select
              value={formData.periode}
              onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
            >
              <option value="TRIMESTRIEL">Trimestrielle</option>
              <option value="SEMESTRIEL">Semestrielle</option>
              <option value="ANNUEL">Annuelle</option>
            </select>
          </div>
        </div>

        {/* Trimestre/Semestre */}
        {formData.periode === "TRIMESTRIEL" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre *</label>
            <select
              value={formData.trimestre}
              onChange={(e) => setFormData({ ...formData, trimestre: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
            >
              <option value={1}>T1</option>
              <option value={2}>T2</option>
              <option value={3}>T3</option>
              <option value={4}>T4</option>
            </select>
          </div>
        )}

        {formData.periode === "SEMESTRIEL" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semestre *</label>
            <select
              value={formData.semestre}
              onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
            >
              <option value={1}>S1</option>
              <option value={2}>S2</option>
            </select>
          </div>
        )}

        {/* Production */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#007A3D]" />
            Données de production
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volume produit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.volumeProduit}
                  onChange={(e) => setFormData({ ...formData, volumeProduit: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                  placeholder="0"
                />
                <select
                  value={formData.uniteMesure}
                  onChange={(e) => setFormData({ ...formData, uniteMesure: e.target.value })}
                  className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="tonnes">tonnes</option>
                  <option value="unités">unités</option>
                  <option value="litres">litres</option>
                  <option value="m³">m³</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur production (FCFA)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valeurProduction}
                onChange={(e) => setFormData({ ...formData, valeurProduction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chiffre d'affaires (FCFA)</label>
              <input
                type="number"
                step="0.01"
                value={formData.chiffreAffaires}
                onChange={(e) => setFormData({ ...formData, chiffreAffaires: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Emplois */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#007A3D]" />
            Emplois
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employés permanents</label>
              <input
                type="number"
                value={formData.nombreEmployes}
                onChange={(e) => setFormData({ ...formData, nombreEmployes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employés temporaires</label>
              <input
                type="number"
                value={formData.nombreEmployesTemporaires}
                onChange={(e) => setFormData({ ...formData, nombreEmployesTemporaires: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Capacité et Qualité */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Capacité et Qualité</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité installée</label>
              <input
                type="number"
                step="0.01"
                value={formData.capaciteInstallee}
                onChange={(e) => setFormData({ ...formData, capaciteInstallee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité utilisée (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.capaciteUtilisee}
                onChange={(e) => setFormData({ ...formData, capaciteUtilisee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux qualité (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tauxQualite}
                onChange={(e) => setFormData({ ...formData, tauxQualite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux disponibilité (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tauxDisponibilite}
                onChange={(e) => setFormData({ ...formData, tauxDisponibilite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0-100"
              />
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volume export</label>
              <input
                type="number"
                step="0.01"
                value={formData.volumeExport}
                onChange={(e) => setFormData({ ...formData, volumeExport: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur export (FCFA)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valeurExport}
                onChange={(e) => setFormData({ ...formData, valeurExport: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays destination</label>
              <input
                type="text"
                value={formData.paysDestination}
                onChange={(e) => setFormData({ ...formData, paysDestination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="France, Belgique, Nigeria..."
              />
            </div>
          </div>
        </div>

        {/* Approvisionnement */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Approvisionnement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matières premières locales (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.matieresPremieresLocal}
                onChange={(e) => setFormData({ ...formData, matieresPremieresLocal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matières premières importées (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.matieresPremieresImport}
                onChange={(e) => setFormData({ ...formData, matieresPremieresImport: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0-100"
              />
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Source de la donnée</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
              <input
                type="text"
                required
                value={formData.sourceDonnee}
                onChange={(e) => setFormData({ ...formData, sourceDonnee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de collecte</label>
              <select
                value={formData.methodeCollecte}
                onChange={(e) => setFormData({ ...formData, methodeCollecte: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
              >
                <option value="Questionnaire en ligne">Questionnaire en ligne</option>
                <option value="Visite sur site">Visite sur site</option>
                <option value="Téléphone">Téléphone</option>
                <option value="Email">Email</option>
                <option value="Déclaration écrite">Déclaration écrite</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            * Champs obligatoires
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/agent")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5" />
                  Enregistrer la saisie
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
