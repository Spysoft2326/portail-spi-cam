"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus, Building2, Search, Filter, Download, ChevronLeft, Save, Loader2,
  Edit3, Trash2, MapPin, Briefcase, Phone, Mail, User, BarChart3,
  Factory, Store, HardHat, Cpu, Truck, Plane, TreePine, Landmark,
  Stethoscope, GraduationCap, MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

interface Enterprise {
  id: string;
  nom: string;
  sigle: string | null;
  description: string | null;
  secteurActivite: string;
  ville: string | null;
  region: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  nomContact: string | null;
  createdAt: string;
}

const SECTEURS = [
  { value: "AGRICULTURE", label: "Agriculture", icon: TreePine, color: "bg-green-100 text-green-700" },
  { value: "INDUSTRIE", label: "Industrie", icon: Factory, color: "bg-blue-100 text-blue-700" },
  { value: "SERVICES", label: "Services", icon: Briefcase, color: "bg-purple-100 text-purple-700" },
  { value: "COMMERCE", label: "Commerce", icon: Store, color: "bg-amber-100 text-amber-700" },
  { value: "CONSTRUCTION", label: "Construction", icon: HardHat, color: "bg-orange-100 text-orange-700" },
  { value: "TECHNOLOGIE", label: "Technologie", icon: Cpu, color: "bg-cyan-100 text-cyan-700" },
  { value: "TRANSPORT", label: "Transport", icon: Truck, color: "bg-rose-100 text-rose-700" },
  { value: "TOURISME", label: "Tourisme", icon: Plane, color: "bg-pink-100 text-pink-700" },
  { value: "SANTE", label: "Santé", icon: Stethoscope, color: "bg-red-100 text-red-700" },
  { value: "EDUCATION", label: "Éducation", icon: GraduationCap, color: "bg-indigo-100 text-indigo-700" },
  { value: "FINANCE", label: "Finance", icon: Landmark, color: "bg-emerald-100 text-emerald-700" },
  { value: "AUTRE", label: "Autre", icon: MoreHorizontal, color: "bg-gray-100 text-gray-700" },
];

const REGIONS = [
  "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral",
  "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"
];

export default function EntreprisesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSecteur, setFilterSecteur] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterVille, setFilterVille] = useState("");

  const [formData, setFormData] = useState({
    nom: "", sigle: "", description: "", secteurActivite: "AUTRE",
    ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "", nom: "", sigle: "", description: "", secteurActivite: "AUTRE",
    ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEnterprises = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/entreprises");
      if (res.ok) {
        const data = await res.json();
        setEnterprises(data.enterprises || data || []);
      } else {
        toast.error("Erreur lors du chargement");
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
    }
  }, [status, router, fetchEnterprises]);

  const resetForm = () => {
    setFormData({
      nom: "", sigle: "", description: "", secteurActivite: "AUTRE",
      ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) { toast.error("Le nom est obligatoire"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/entreprises", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Entreprise ajoutée !");
        resetForm(); setShowForm(false); fetchEnterprises();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur");
      }
    } catch { toast.error("Erreur de connexion"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (enterprise: Enterprise) => {
    setEditingId(enterprise.id);
    setEditFormData({
      id: enterprise.id, nom: enterprise.nom, sigle: enterprise.sigle || "",
      description: enterprise.description || "", secteurActivite: enterprise.secteurActivite,
      ville: enterprise.ville || "", region: enterprise.region || "",
      adresse: enterprise.adresse || "", telephone: enterprise.telephone || "",
      email: enterprise.email || "", nomContact: enterprise.nomContact || "",
    });
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.nom.trim()) { toast.error("Le nom est obligatoire"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/entreprises/${editFormData.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        toast.success("Entreprise mise à jour !");
        setEditingId(null); setShowForm(false); resetForm(); fetchEnterprises();
      } else { toast.error("Erreur"); }
    } catch { toast.error("Erreur de connexion"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entreprise ?")) return;
    try {
      const res = await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Entreprise supprimée"); fetchEnterprises(); }
      else { toast.error("Erreur"); }
    } catch { toast.error("Erreur de connexion"); }
  };

  const getSecteurInfo = (secteur: string) => {
    return SECTEURS.find((s) => s.value === secteur) || SECTEURS[SECTEURS.length - 1];
  };

  const getSecteurCount = (secteur: string) => {
    return enterprises.filter((e) => e.secteurActivite === secteur).length;
  };

  const filteredEnterprises = enterprises.filter((e) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = e.nom.toLowerCase().includes(searchLower) ||
      (e.sigle && e.sigle.toLowerCase().includes(searchLower)) ||
      (e.description && e.description.toLowerCase().includes(searchLower)) ||
      (e.ville && e.ville.toLowerCase().includes(searchLower));
    const matchSecteur = !filterSecteur || e.secteurActivite === filterSecteur;
    const matchRegion = !filterRegion || e.region === filterRegion;
    const matchVille = !filterVille || (e.ville && e.ville.toLowerCase().includes(filterVille.toLowerCase()));
    return matchSearch && matchSecteur && matchRegion && matchVille;
  });

  const villesUniques = Array.from(new Set(enterprises.map((e) => e.ville).filter((v): v is string => typeof v === "string"))).sort();

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
          <ChevronLeft className="h-4 w-4" /> Retour à l'annuaire
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="h-6 w-6 text-blue-700" /></div>
          <div>
            <h1 className="text-2xl font-bold">{editingId ? "Modifier l'entreprise" : "Ajouter une entreprise"}</h1>
            <p className="text-sm text-gray-500">{editingId ? "Mise à jour" : "Nouvelle fiche"}</p>
          </div>
        </div>

        <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-8">
          {/* Identité */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Building2 className="h-5 w-5 text-blue-600" /> Identité de l'entreprise
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dénomination <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nom de l'entreprise" required
                  value={currentForm.nom} onChange={(e) => setCurrent("nom", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sigle</label>
                <input type="text" placeholder="Sigle"
                  value={currentForm.sigle} onChange={(e) => setCurrent("sigle", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <input type="text" placeholder="Description de l'activité..."
                value={currentForm.description} onChange={(e) => setCurrent("description", e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secteur d'activité <span className="text-red-500">*</span></label>
              <select value={currentForm.secteurActivite} onChange={(e) => setCurrent("secteurActivite", e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {SECTEURS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Localisation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-orange-600" /> Localisation
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <input type="text" placeholder="Ex: Yaoundé, Douala..."
                  value={currentForm.ville} onChange={(e) => setCurrent("ville", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Région</label>
                <select value={currentForm.region} onChange={(e) => setCurrent("region", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Non spécifiée</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse postale / BP</label>
              <input type="text" placeholder="Ex: BP 1234 Yaoundé..."
                value={currentForm.adresse} onChange={(e) => setCurrent("adresse", e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <User className="h-5 w-5 text-purple-600" /> Contact
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium"><User className="h-3.5 w-3.5 inline mr-1" /> Nom du contact</label>
                <input type="text" placeholder="Ex: Jean Dupont..."
                  value={currentForm.nomContact} onChange={(e) => setCurrent("nomContact", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium"><Phone className="h-3.5 w-3.5 inline mr-1" /> Téléphone</label>
                <input type="text" placeholder="Ex: +237 6XX XXX XXX"
                  value={currentForm.telephone} onChange={(e) => setCurrent("telephone", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium"><Mail className="h-3.5 w-3.5 inline mr-1" /> Email</label>
              <input type="email" placeholder="Ex: contact@entreprise.cm"
                value={currentForm.email} onChange={(e) => setCurrent("email", e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={submitting}
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
          <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="h-6 w-6 text-blue-700" /></div>
          <div>
            <h1 className="text-2xl font-bold">Annuaire des Entreprises</h1>
            <p className="text-sm text-gray-500">{enterprises.length} entreprises répertoriées</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const csv = [["Nom", "Sigle", "Secteur", "Ville", "Région", "Téléphone", "Email", "Contact"].join(","),
              ...filteredEnterprises.map((e) => [e.nom, e.sigle || "", e.secteurActivite, e.ville || "", e.region || "", e.telephone || "", e.email || "", e.nomContact || ""].join(","))].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `entreprises_${new Date().toISOString().split("T")[0]}.csv`; a.click();
          }} className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" /> Exporter CSV
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* Compteurs par secteur */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {SECTEURS.map((secteur) => {
          const count = getSecteurCount(secteur.value);
          const Icon = secteur.icon;
          return (
            <div key={secteur.value}
              onClick={() => setFilterSecteur(filterSecteur === secteur.value ? "" : secteur.value)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${filterSecteur === secteur.value ? "ring-2 ring-blue-500" : "bg-white"}`}>
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-lg mb-2 ${secteur.color}`}><Icon className="h-5 w-5" /></div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-500">{secteur.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="p-4 rounded-lg border bg-white">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
          <Filter className="h-4 w-4" /> Filtres
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Nom, sigle, description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={filterSecteur} onChange={(e) => setFilterSecteur(e.target.value)}
            className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Tous les secteurs</option>
            {SECTEURS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}
            className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Toutes les régions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterVille} onChange={(e) => setFilterVille(e.target.value)}
            className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Toutes les villes</option>
            {villesUniques.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="rounded-lg border bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5" /> Résultats
          </div>
          <p className="text-sm text-gray-500 mt-1">{filteredEnterprises.length} résultat{filteredEnterprises.length > 1 ? "s" : ""}</p>
        </div>
        <div className="p-4">
          {filteredEnterprises.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Aucune entreprise trouvée</h3>
              <button onClick={() => { resetForm(); setShowForm(true); }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" /> Ajouter une entreprise
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEnterprises.map((enterprise) => {
                const secteurInfo = getSecteurInfo(enterprise.secteurActivite);
                const SecteurIcon = secteurInfo.icon;
                return (
                  <div key={enterprise.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${secteurInfo.color}`}><SecteurIcon className="h-5 w-5" /></div>
                      <div>
                        <p className="font-medium">{enterprise.nom}</p>
                        {enterprise.sigle && <p className="text-sm text-gray-500">{enterprise.sigle}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 border rounded text-xs">{secteurInfo.label}</span>
                          {enterprise.ville && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {enterprise.ville}{enterprise.region && `, ${enterprise.region}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(enterprise)} className="p-2 hover:bg-gray-100 rounded">
                        <Edit3 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button onClick={() => handleDelete(enterprise.id)} className="p-2 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
