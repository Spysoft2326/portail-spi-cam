"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Plus,
  Loader2,
  Save,
  Calendar,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
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
  const [loading, setLoading] = useState(false);
  const [loadingEntreprises, setLoadingEntreprises] = useState(true);
  const [entreprises, setEntreprises] = useState<Enterprise[]>([]);
  const [showNewEnterprise, setShowNewEnterprise] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formulaire production
  const [formData, setFormData] = useState({
    entrepriseId: "",
    annee: new Date().getFullYear().toString(),
    trimestre: "",
    productionPhysique: "",
    chiffreAffaires: "",
    effectifs: "",
    investissements: "",
    commentaire: "",
  });

  // Formulaire nouvelle entreprise
  const [newEnterprise, setNewEnterprise] = useState({
    referenceSPI: "",
    denomination: "",
    sigle: "",
    formeJuridique: "",
    capitalSocial: "",
    adresse: "",
    ville: "",
    departement: "",
    region: "",
    telephone: "",
    email: "",
    siteWeb: "",
    numContribuable: "",
    secteurActivite: "AUTRE",
    sousSecteur: "",
    produitsPrincipaux: "",
    estExportateur: false,
    estDansZoneIndustrielle: false,
    nomZoneIndustrielle: "",
  });

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    try {
      const res = await fetch("/api/entreprises");
      const data = await res.json();
      setEntreprises(data.entreprises || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEntreprises(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let entrepriseId = formData.entrepriseId;

      // Si nouvelle entreprise
      if (showNewEnterprise) {
        const resEnterprise = await fetch("/api/entreprises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEnterprise),
        });

        const dataEnterprise = await resEnterprise.json();

        if (!resEnterprise.ok) {
          setError(dataEnterprise.error || "Erreur création entreprise");
          setLoading(false);
          return;
        }

        entrepriseId = dataEnterprise.entreprise.id;
      }

      // Créer la production
      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          entrepriseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la sauvegarde");
      } else {
        setSuccess("Production enregistrée avec succès !");
        setTimeout(() => router.push("/production"), 1500);
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNewEnterpriseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setNewEnterprise((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setNewEnterprise((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/production"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle saisie</h1>
          <p className="text-sm text-gray-500">Production trimestrielle</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Entreprise */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#007A3D]" />
            Entreprise
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="existing"
                name="enterpriseType"
                checked={!showNewEnterprise}
                onChange={() => setShowNewEnterprise(false)}
                className="w-4 h-4 text-[#007A3D]"
              />
              <label htmlFor="existing" className="text-sm text-gray-700">
                Entreprise existante
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="new"
                name="enterpriseType"
                checked={showNewEnterprise}
                onChange={() => setShowNewEnterprise(true)}
                className="w-4 h-4 text-[#007A3D]"
              />
              <label htmlFor="new" className="text-sm text-gray-700">
                Nouvelle entreprise
              </label>
            </div>

            {!showNewEnterprise ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner une entreprise *
                </label>
                <select
                  name="entrepriseId"
                  value={formData.entrepriseId}
                  onChange={handleChange}
                  required={!showNewEnterprise}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                >
                  <option value="">Choisir...</option>
                  {entreprises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.denomination} ({e.referenceSPI})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Référence SPI *
                    </label>
                    <input
                      type="text"
                      name="referenceSPI"
                      value={newEnterprise.referenceSPI}
                      onChange={handleNewEnterpriseChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                      placeholder="SPI-XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dénomination *
                    </label>
                    <input
                      type="text"
                      name="denomination"
                      value={newEnterprise.denomination}
                      onChange={handleNewEnterpriseChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sigle
                    </label>
                    <input
                      type="text"
                      name="sigle"
                      value={newEnterprise.sigle}
                      onChange={handleNewEnterpriseChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forme juridique
                    </label>
                    <input
                      type="text"
                      name="formeJuridique"
                      value={newEnterprise.formeJuridique}
                      onChange={handleNewEnterpriseChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Région *
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={newEnterprise.region}
                      onChange={handleNewEnterpriseChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={newEnterprise.ville}
                      onChange={handleNewEnterpriseChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secteur d'activité
                  </label>
                  <select
                    name="secteurActivite"
                    value={newEnterprise.secteurActivite}
                    onChange={handleNewEnterpriseChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                  >
                    <option value="AUTRE">Autre</option>
                    <option value="AGROALIMENTAIRE">Agroalimentaire</option>
                    <option value="TEXTILE">Textile</option>
                    <option value="CHIMIE">Chimie</option>
                    <option value="MINES">Mines</option>
                    <option value="BOIS">Bois</option>
                    <option value="ENERGIE">Énergie</option>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="SERVICES">Services</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Période */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#007A3D]" />
            Période
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année *
              </label>
              <input
                type="number"
                name="annee"
                value={formData.annee}
                onChange={handleChange}
                required
                min="2020"
                max="2030"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trimestre *
              </label>
              <select
                name="trimestre"
                value={formData.trimestre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
              >
                <option value="">Choisir...</option>
                <option value="1">T1 (Jan-Mar)</option>
                <option value="2">T2 (Avr-Juin)</option>
                <option value="3">T3 (Juil-Sep)</option>
                <option value="4">T4 (Oct-Déc)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Données */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#007A3D]" />
            Données de production
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Production physique (tonnes/unités)
              </label>
              <input
                type="number"
                name="productionPhysique"
                value={formData.productionPhysique}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chiffre d'affaires (FCFA)
              </label>
              <input
                type="number"
                name="chiffreAffaires"
                value={formData.chiffreAffaires}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effectifs
              </label>
              <input
                type="number"
                name="effectifs"
                value={formData.effectifs}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investissements (FCFA)
              </label>
              <input
                type="number"
                name="investissements"
                value={formData.investissements}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire
            </label>
            <textarea
              name="commentaire"
              value={formData.commentaire}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A3D] outline-none"
              placeholder="Informations complémentaires..."
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/production"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
