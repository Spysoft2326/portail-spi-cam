"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  Search,
  Filter,
  Download,
  ChevronLeft,
  Save,
  Loader2,
  Edit3,
  Trash2,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  User,
  BarChart3,
  Factory,
  Store,
  HardHat,
  Cpu,
  Truck,
  Plane,
  TreePine,
  Landmark,
  Stethoscope,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSecteur, setFilterSecteur] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [filterVille, setFilterVille] = useState<string>("");

  const [formData, setFormData] = useState({
    nom: "",
    sigle: "",
    description: "",
    secteurActivite: "AUTRE",
    ville: "",
    region: "",
    adresse: "",
    telephone: "",
    email: "",
    nomContact: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    nom: "",
    sigle: "",
    description: "",
    secteurActivite: "AUTRE",
    ville: "",
    region: "",
    adresse: "",
    telephone: "",
    email: "",
    nomContact: "",
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
        toast.error("Erreur lors du chargement des entreprises");
      }
    } catch (error) {
      console.error("Erreur fetch enterprises:", error);
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
      nom: "",
      sigle: "",
      description: "",
      secteurActivite: "AUTRE",
      ville: "",
      region: "",
      adresse: "",
      telephone: "",
      email: "",
      nomContact: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      toast.error("Le nom de l'entreprise est obligatoire");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/entreprises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Entreprise ajoutée avec succès !");
        resetForm();
        setShowForm(false);
        fetchEnterprises();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (enterprise: Enterprise) => {
    setEditingId(enterprise.id);
    setEditFormData({
      id: enterprise.id,
      nom: enterprise.nom,
      sigle: enterprise.sigle || "",
      description: enterprise.description || "",
      secteurActivite: enterprise.secteurActivite,
      ville: enterprise.ville || "",
      region: enterprise.region || "",
      adresse: enterprise.adresse || "",
      telephone: enterprise.telephone || "",
      email: enterprise.email || "",
      nomContact: enterprise.nomContact || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.nom.trim()) {
      toast.error("Le nom de l'entreprise est obligatoire");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/entreprises/${editFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        toast.success("Entreprise mise à jour !");
        setEditingId(null);
        setShowForm(false);
        resetForm();
        fetchEnterprises();
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;

    try {
      const res = await fetch(`/api/entreprises/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Entreprise supprimée");
        fetchEnterprises();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  };

  const getSecteurInfo = (secteur: string) => {
    return SECTEURS.find((s) => s.value === secteur) || SECTEURS[SECTEURS.length - 1];
  };

  const getSecteurCount = (secteur: string) => {
    return enterprises.filter((e) => e.secteurActivite === secteur).length;
  };

  const filteredEnterprises = enterprises.filter((e) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      e.nom.toLowerCase().includes(searchLower) ||
      (e.sigle && e.sigle.toLowerCase().includes(searchLower)) ||
      (e.description && e.description.toLowerCase().includes(searchLower)) ||
      (e.ville && e.ville.toLowerCase().includes(searchLower));
    const matchSecteur = !filterSecteur || e.secteurActivite === filterSecteur;
    const matchRegion = !filterRegion || e.region === filterRegion;
    const matchVille = !filterVille || (e.ville && e.ville.toLowerCase().includes(filterVille.toLowerCase()));
    return matchSearch && matchSecteur && matchRegion && matchVille;
  });

  const villesUniques = Array.from(new Set(enterprises.map((e) => e.ville).filter(Boolean))).sort();

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // ==================== FORMULAIRE DE SAISIE ====================
  if (showForm) {
    const currentForm = editingId ? editFormData : formData;
    const updateField = (field: string, value: string) => {
      if (editingId) {
        setEditFormData({ ...editFormData, [field]: value });
      } else {
        setFormData({ ...formData, [field]: value });
      }
    };

    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour à l'annuaire
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {editingId ? "Modifier l'entreprise" : "Ajouter une entreprise"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {editingId ? "Mise à jour des informations" : "Nouvelle fiche entreprise"}
            </p>
          </div>
        </div>

        <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Building2 className="h-5 w-5 text-blue-600" />
              Identité de l'entreprise
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">
                  Dénomination <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  placeholder="Nom de l'entreprise"
                  value={currentForm.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sigle">Sigle</Label>
                <Input
                  id="sigle"
                  placeholder="Sigle ou abréviation"
                  value={currentForm.sigle}
                  onChange={(e) => updateField("sigle", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description de l'activité..."
                value={currentForm.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secteur">
                Secteur d'activité <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentForm.secteurActivite}
                onValueChange={(value) => updateField("secteurActivite", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTEURS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div className="flex items-center gap-2">
                        <s.icon className="h-4 w-4" />
                        {s.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-orange-600" />
              Localisation
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  placeholder="Ex: Yaoundé, Douala..."
                  value={currentForm.ville}
                  onChange={(e) => updateField("ville", e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Région</Label>
                <Select
                  value={currentForm.region}
                  onValueChange={(value) => updateField("region", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choisir une région..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Non spécifiée</SelectItem>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse postale / BP</Label>
              <Input
                id="adresse"
                placeholder="Ex: BP 1234 Yaoundé, Rue des Palmiers"
                value={currentForm.adresse}
                onChange={(e) => updateField("adresse", e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <User className="h-5 w-5 text-purple-600" />
              Contact de l'entreprise
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomContact">
                  <User className="h-3.5 w-3.5 inline mr-1" />
                  Nom du contact / Responsable
                </Label>
                <Input
                  id="nomContact"
                  placeholder="Ex: Jean Dupont, Directeur Commercial"
                  value={currentForm.nomContact}
                  onChange={(e) => updateField("nomContact", e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">
                  <Phone className="h-3.5 w-3.5 inline mr-1" />
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  placeholder="Ex: +237 6XX XXX XXX"
                  value={currentForm.telephone}
                  onChange={(e) => updateField("telephone", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-3.5 w-3.5 inline mr-1" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: contact@entreprise.cm"
                value={currentForm.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Mettre à jour" : "Enregistrer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ==================== LISTE DES ENTREPRISES ====================
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Annuaire des Entreprises</h1>
            <p className="text-sm text-muted-foreground">
              {enterprises.length} entreprises répertoriées
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = [
                ["Nom", "Sigle", "Secteur", "Ville", "Région", "Téléphone", "Email", "Contact"].join(","),
                ...filteredEnterprises.map((e) =>
                  [
                    e.nom,
                    e.sigle || "",
                    e.secteurActivite,
                    e.ville || "",
                    e.region || "",
                    e.telephone || "",
                    e.email || "",
                    e.nomContact || "",
                  ].join(",")
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `entreprises_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {SECTEURS.map((secteur) => {
          const count = getSecteurCount(secteur.value);
          const Icon = secteur.icon;
          return (
            <Card
              key={secteur.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                filterSecteur === secteur.value ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() =>
                setFilterSecteur(filterSecteur === secteur.value ? "" : secteur.value)
              }
            >
              <CardContent className="p-3 flex flex-col items-center text-center">
                <div className={`p-2 rounded-lg mb-2 ${secteur.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{secteur.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom, sigle, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterSecteur} onValueChange={setFilterSecteur}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les secteurs</SelectItem>
                {SECTEURS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div className="flex items-center gap-2">
                      <s.icon className="h-4 w-4" />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les régions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les régions</SelectItem>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterVille} onValueChange={setFilterVille}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les villes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les villes</SelectItem>
                {villesUniques.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Résultats
          </CardTitle>
          <CardDescription>
            {filteredEnterprises.length} résultat{filteredEnterprises.length > 1 ? "s" : ""} trouvé
            {filteredEnterprises.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEnterprises.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune entreprise trouvée</h3>
              <p className="text-muted-foreground mt-1">
                Ajustez vos filtres ou ajoutez une nouvelle entreprise.
              </p>
              <Button
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une entreprise
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEnterprises.map((enterprise) => {
                const secteurInfo = getSecteurInfo(enterprise.secteurActivite);
                const SecteurIcon = secteurInfo.icon;
                return (
                  <div
                    key={enterprise.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${secteurInfo.color}`}>
                        <SecteurIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{enterprise.nom}</p>
                        {enterprise.sigle && (
                          <p className="text-sm text-muted-foreground">{enterprise.sigle}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {secteurInfo.label}
                          </Badge>
                          {enterprise.ville && (
                            <Badge variant="secondary" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {enterprise.ville}
                              {enterprise.region && `, ${enterprise.region}`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(enterprise)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(enterprise.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
