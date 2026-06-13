"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus, Factory, CalendarDays, TrendingUp, Package, DollarSign, Building2,
  Save, Loader2, ChevronLeft, BarChart3, Search, Filter, Download,
  Edit3, Trash2, X
} from "lucide-react";
import { toast } from "sonner";

interface Enterprise {
  id: string;
  nom: string;
  sigle: string | null;
  secteurActivite: string;
  ville: string | null;
  region: string | null;
}

interface Production {
  id: string;
  entrepriseId: string;
  entreprise: Enterprise;
  annee: number;
  trimestre: string;
  productionPhysique: number;
  chiffreAffaires: number;
  nombreEmployes: number;
  createdAt: string;
}

const TRIMESTRES = [
  { value: "T1", label: "T1 (Janvier - Mars)" },
  { value: "T2", label: "T2 (Avril - Juin)" },
  { value: "T3", label: "T3 (Juillet - Septembre)" },
  { value: "T4", label: "T4 (Octobre - Décembre)" },
];

const ANNEES = [2024, 2025, 2026, 2027];

export default function ProductionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [productions, setProductions] = useState<Production[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnnee, setFilterAnnee] = useState("");
  const [filterTrimestre, setFilterTrimestre] = useState("");

  const [formData, setFormData] = useState({
    entrepriseId: "",
    annee: new Date().getFullYear().toString(),
    trimestre: "T1",
    productionPhysique: "",
    chiffreAffaires: "",
    nombreEmployes: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "", entrepriseId: "", annee: "", trimestre: "",
    productionPhysique: "", chiffreAffaires: "", nombreEmployes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEnterprises = useCallback(async () => {
    try {
      const res = await fetch("/api/entreprises");
      if (res.ok) {
        const data = await res.json();
        setEnterprises(data.enterprises || data || []);
      }
    } catch (error) {
      console.error("Erreur fetch enterprises:", error);
    }
  }, []);

  const fetchProductions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/productions");
      if (res.ok) {
        const data = await res.json();
        setProductions(data.productions || data || []);
      } else {
        toast.error("Erreur lors du chargement des productions");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchEnterprises();
      fetchProductions();
    }
  }, [status, router, fetchEnterprises, fetchProductions]);

  const resetForm = () => {
    setFormData({
      entrepriseId: "", annee: new Date().getFullYear().toString(),
      trimestre: "T1", productionPhysique: "", chiffreAffaires: "", nombreEmployes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entrepriseId) { toast.error("Veuillez sélectionner une entreprise"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrepriseId: formData.entrepriseId,
          annee: parseInt(formData.annee),
          trimestre: formData.trimestre,
          productionPhysique: parseFloat(formData.productionPhysique) || 0,
          chiffreAffaires: parseFloat(formData.chiffreAffaires) || 0,
          nombreEmployes: parseInt(formData.nombreEmployes) || 0,
        }),
      });
      if (res.ok) {
        toast.success("Production enregistrée !");
        resetForm(); setShowForm(false); fetchProductions();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur");
      }
    } catch { toast.error("Erreur de connexion"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (production: Production) => {
    setEditingId(production.id);
    setEditFormData({
      id: production.id, entrepriseId: production.entrepriseId,
      annee: production.annee.toString(), trimestre: production.trimestre,
      productionPhysique: production.productionPhysique.toString(),
      chiffreAffaires: production.chiffreAffaires.toString(),
      nombreEmployes: production.nombreEmployes.toString(),
    });
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/productions/${editFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annee: parseInt(editFormData.annee),
          trimestre: editFormData.trimestre,
          productionPhysique: parseFloat(editFormData.productionPhysique) || 0,
          chiffreAffaires: parseFloat(editFormData.chiffreAffaires) || 0,
          nombreEmployes: parseInt(editFormData.nombreEmployes) || 0,
        }),
      });
      if (res.ok) {
        toast.success("Production mise à jour !");
        setEditingId(null); setShowForm(false); resetForm(); fetchProductions();
      } else { toast.error("Erreur lors de la mise à jour"); }
    } catch { toast.error("Erreur de connexion"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette production ?")) return;
    try {
      const res = await fetch(`/api/productions/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Production supprimée"); fetchProductions(); }
      else { toast.error("Erreur"); }
    } catch { toast.error("Erreur de connexion"); }
  };

  const getEnterpriseName = (id: string) => {
    const ent = enterprises.find((e) => e.id === id);
    return ent ? `${ent.nom}${ent.sigle ? ` (${ent.sigle})` : ""}` : "Entreprise inconnue";
  };

  const getEnterpriseSector = (id: string) => {
    const ent = enterprises.find((e) => e.id === id);
    return ent?.secteurActivite || "N/A";
  };

  const filteredProductions = productions.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = getEnterpriseName(p.entrepriseId).toLowerCase().includes(searchLower) ||
      p.trimestre.toLowerCase().includes(searchLower) || p.annee.toString().includes(searchLower);
    const matchAnnee = !filterAnnee || p.annee.toString() === filterAnnee;
    const matchTrimestre = !filterTrimestre || p.trimestre === filterTrimestre;
    return matchSearch && matchAnnee && matchTrimestre;
  });

  const totalProduction = filteredProductions.reduce((sum, p) => sum + p.productionPhysique, 0);
  const totalCA = filteredProductions.reduce((sum, p) => sum + p.chiffreAffaires, 0);
  const totalEmployes = filteredProductions.reduce((sum, p) => sum + p.nombreEmployes, 0);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  // ==================== FORMULAIRE ====================
  if (showForm) {
    const currentForm = editingId ? editFormData : formData;
    const setCurrent = (field: string, value: string) => {
      if (editingId) setEditFormData(prev => ({ ...prev, [field]: value }));
      else setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <button onClick={() => { setShowForm(false); resetForm(); }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Retour aux productions
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg"><Factory className="h-6 w-6 text-emerald-700" /></div>
          <div>
            <h1 className="text-2xl font-bold">{editingId ? "Modifier la production" : "Nouvelle saisie"}</h1>
            <p className="text-sm text-gray-500">Production trimestrielle</p>
          </div>
        </div>

        <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-8">
          {/* Section Entreprise */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Building2 className="h-5 w-5 text-blue-600" /> Entreprise
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sélectionner une entreprise <span className="text-red-500">*</span></label>
              <select
                value={currentForm.entrepriseId}
                onChange={(e) => setCurrent("entrepriseId", e.target.value)}
                disabled={!!editingId}
                className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Choisir une entreprise...</option>
                {enterprises.map((ent) => (
                  <option key={ent.id} value={ent.id}>{ent.nom}{ent.sigle ? ` (${ent.sigle})` : ""}</option>
                ))}
              </select>
              {currentForm.entrepriseId && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-md">
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">{getEnterpriseSector(currentForm.entrepriseId)}</span>
                  <span>{getEnterpriseName(currentForm.entrepriseId)}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section Période */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <CalendarDays className="h-5 w-5 text-orange-600" /> Période
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Année <span className="text-red-500">*</span></label>
                <select
                  value={currentForm.annee}
                  onChange={(e) => setCurrent("annee", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ANNEES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trimestre <span className="text-red-500">*</span></label>
                <select
                  value={currentForm.trimestre}
                  onChange={(e) => setCurrent("trimestre", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {TRIMESTRES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section Données */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <TrendingUp className="h-5 w-5 text-purple-600" /> Données de production
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium"><Package className="h-3.5 w-3.5 inline mr-1" /> Production physique</label>
                <input type="number" step="0.01" placeholder="0"
                  value={currentForm.productionPhysique}
                  onChange={(e) => setCurrent("productionPhysique", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-gray-400">tonnes, unités, etc.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium"><DollarSign className="h-3.5 w-3.5 inline mr-1" /> Chiffre d'affaires</label>
                <input type="number" step="0.01" placeholder="0"
                  value={currentForm.chiffreAffaires}
                  onChange={(e) => setCurrent("chiffreAffaires", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-gray-400">en FCFA</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium"><Building2 className="h-3.5 w-3.5 inline mr-1" /> Nombre d'employés</label>
                <input type="number" placeholder="0"
                  value={currentForm.nombreEmployes}
                  onChange={(e) => setCurrent("nombreEmployes", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-gray-400">effectif total</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={submitting || (!editingId && !formData.entrepriseId)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</> : <><Save className="h-4 w-4" /> {editingId ? "Mettre à jour" : "Enregistrer"}</>}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==================== LISTE ====================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg"><Factory className="h-6 w-6 text-emerald-700" /></div>
          <div>
            <h1 className="text-2xl font-bold">Production</h1>
            <p className="text-sm text-gray-500">Gestion des saisies trimestrielles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const csv = [["Entreprise", "Année", "Trimestre", "Production", "CA (FCFA)", "Employés"].join(","),
              ...filteredProductions.map((p) => [getEnterpriseName(p.entrepriseId), p.annee, p.trimestre, p.productionPhysique, p.chiffreAffaires, p.nombreEmployes].join(","))].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `productions_${new Date().toISOString().split("T")[0]}.csv`; a.click();
          }} className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" /> Exporter CSV
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nouvelle saisie
          </button>
        </div>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total productions", value: filteredProductions.length, sub: "saisies", color: "emerald" },
          { label: "Production physique", value: totalProduction.toLocaleString(), sub: "tonnes/unités", color: "blue" },
          { label: "Chiffre d'affaires", value: `${totalCA.toLocaleString()} FCFA`, sub: "cumulé", color: "amber" },
          { label: "Emplois créés", value: totalEmployes.toLocaleString(), sub: "employés", color: "purple" },
        ].map((item) => (
          <div key={item.label} className={`p-4 rounded-lg border bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border-${item.color}-200`}>
            <p className={`text-sm font-medium text-${item.color}-700`}>{item.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{item.value}</p>
            <p className={`text-xs text-${item.color}-600 mt-1`}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="p-4 rounded-lg border bg-white">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
          <Filter className="h-4 w-4" /> Filtres
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={filterAnnee} onChange={(e) => setFilterAnnee(e.target.value)}
            className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Toutes les années</option>
            {ANNEES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterTrimestre} onChange={(e) => setFilterTrimestre(e.target.value)}
            className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Tous les trimestres</option>
            {TRIMESTRES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="rounded-lg border bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5" /> Historique des saisies
          </div>
          <p className="text-sm text-gray-500 mt-1">{filteredProductions.length} résultat{filteredProductions.length > 1 ? "s" : ""}</p>
        </div>
        <div className="p-4">
          {filteredProductions.length === 0 ? (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Aucune production enregistrée</h3>
              <button onClick={() => { resetForm(); setShowForm(true); }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" /> Nouvelle saisie
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProductions.map((production) => (
                <div key={production.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-100 rounded-lg"><Factory className="h-5 w-5 text-emerald-700" /></div>
                    <div>
                      <p className="font-medium">{getEnterpriseName(production.entrepriseId)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 border rounded text-xs">{production.annee} - {production.trimestre}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{getEnterpriseSector(production.entrepriseId)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">{production.productionPhysique.toLocaleString()} unités</p>
                      <p className="text-xs text-gray-500">{production.chiffreAffaires.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(production)} className="p-2 hover:bg-gray-100 rounded">
                        <Edit3 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button onClick={() => handleDelete(production.id)} className="p-2 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
