"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Factory,
  CalendarDays,
  TrendingUp,
  Package,
  DollarSign,
  Building2,
  Save,
  Loader2,
  ChevronLeft,
  BarChart3,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [productions, setProductions] = useState<Production[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnnee, setFilterAnnee] = useState<string>("");
  const [filterTrimestre, setFilterTrimestre] = useState<string>("");

  const [formData, setFormData] = useState({
    entrepriseId: "",
    annee: new Date().getFullYear().toString(),
    trimestre: "T1",
    productionPhysique: "",
    chiffreAffaires: "",
    nombreEmployes: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    entrepriseId: "",
    annee: "",
    trimestre: "",
    productionPhysique: "",
    chiffreAffaires: "",
    nombreEmployes: "",
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
      console.error("Erreur fetch productions:", error);
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
      entrepriseId: "",
      annee: new Date().getFullYear().toString(),
      trimestre: "T1",
      productionPhysique: "",
      chiffreAffaires: "",
      nombreEmployes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entrepriseId) {
      toast.error("Veuillez sélectionner une entreprise");
      return;
    }

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
        toast.success("Production enregistrée avec succès !");
        resetForm();
        setShowForm(false);
        fetchProductions();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (production: Production) => {
    setEditingId(production.id);
    setEditFormData({
      id: production.id,
      entrepriseId: production.entrepriseId,
      annee: production.annee.toString(),
      trimestre: production.trimestre,
      productionPhysique: production.productionPhysique.toString(),
      chiffreAffaires: production.chiffreAffaires.toString(),
      nombreEmployes: production.nombreEmployes.toString(),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        setEditingId(null);
        setShowForm(false);
        resetForm();
        fetchProductions();
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette production ?")) return;

    try {
      const res = await fetch(`/api/productions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Production supprimée");
        fetchProductions();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
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
    const matchSearch =
      getEnterpriseName(p.entrepriseId).toLowerCase().includes(searchLower) ||
      p.trimestre.toLowerCase().includes(searchLower) ||
      p.annee.toString().includes(searchLower);
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // ==================== FORMULAIRE DE SAISIE ====================
  if (showForm) {
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
            Retour aux productions
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Factory className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {editingId ? "Modifier la production" : "Nouvelle saisie"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Production trimestrielle
            </p>
          </div>
        </div>

        <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Building2 className="h-5 w-5 text-blue-600" />
              Entreprise
            </div>
            <div className="space-y-2">
              <Label htmlFor="entreprise">
                Sélectionner une entreprise <span className="text-red-500">*</span>
              </Label>
              <Select
                value={editingId ? editFormData.entrepriseId : formData.entrepriseId}
                onValueChange={(value) => {
                  if (editingId) {
                    setEditFormData({ ...editFormData, entrepriseId: value });
                  } else {
                    setFormData({ ...formData, entrepriseId: value });
                  }
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choisir une entreprise..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {enterprises.length === 0 ? (
                    <SelectItem value="" disabled>
                      Aucune entreprise disponible
                    </SelectItem>
                  ) : (
                    enterprises.map((ent) => (
                      <SelectItem key={ent.id} value={ent.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{ent.nom}</span>
                          {ent.sigle && (
                            <span className="text-xs text-muted-foreground">{ent.sigle}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {(editingId ? editFormData.entrepriseId : formData.entrepriseId) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-2 rounded-md">
                  <Badge variant="secondary" className="text-xs">
                    {getEnterpriseSector(editingId ? editFormData.entrepriseId : formData.entrepriseId)}
                  </Badge>
                  <span>
                    {getEnterpriseName(editingId ? editFormData.entrepriseId : formData.entrepriseId)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <CalendarDays className="h-5 w-5 text-orange-600" />
              Période
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annee">
                  Année <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingId ? editFormData.annee : formData.annee}
                  onValueChange={(value) => {
                    if (editingId) {
                      setEditFormData({ ...editFormData, annee: value });
                    } else {
                      setFormData({ ...formData, annee: value });
                    }
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANNEES.map((a) => (
                      <SelectItem key={a} value={a.toString()}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimestre">
                  Trimestre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingId ? editFormData.trimestre : formData.trimestre}
                  onValueChange={(value) => {
                    if (editingId) {
                      setEditFormData({ ...editFormData, trimestre: value });
                    } else {
                      setFormData({ ...formData, trimestre: value });
                    }
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTRES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Données de production
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productionPhysique">
                  <Package className="h-3.5 w-3.5 inline mr-1" />
                  Production physique
                </Label>
                <Input
                  id="productionPhysique"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={editingId ? editFormData.productionPhysique : formData.productionPhysique}
                  onChange={(e) => {
                    if (editingId) {
                      setEditFormData({ ...editFormData, productionPhysique: e.target.value });
                    } else {
                      setFormData({ ...formData, productionPhysique: e.target.value });
                    }
                  }}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">tonnes, unités, etc.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chiffreAffaires">
                  <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                  Chiffre d'affaires
                </Label>
                <Input
                  id="chiffreAffaires"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={editingId ? editFormData.chiffreAffaires : formData.chiffreAffaires}
                  onChange={(e) => {
                    if (editingId) {
                      setEditFormData({ ...editFormData, chiffreAffaires: e.target.value });
                    } else {
                      setFormData({ ...formData, chiffreAffaires: e.target.value });
                    }
                  }}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">en FCFA</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreEmployes">
                  <Building2 className="h-3.5 w-3.5 inline mr-1" />
                  Nombre d'employés
                </Label>
                <Input
                  id="nombreEmployes"
                  type="number"
                  placeholder="0"
                  value={editingId ? editFormData.nombreEmployes : formData.nombreEmployes}
                  onChange={(e) => {
                    if (editingId) {
                      setEditFormData({ ...editFormData, nombreEmployes: e.target.value });
                    } else {
                      setFormData({ ...formData, nombreEmployes: e.target.value });
                    }
                  }}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">effectif total</p>
              </div>
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
              disabled={submitting || (!editingId && !formData.entrepriseId)}
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

  // ==================== LISTE DES PRODUCTIONS ====================
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Factory className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Production</h1>
            <p className="text-sm text-muted-foreground">
              Gestion des saisies trimestrielles de production
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = [
                ["Entreprise", "Année", "Trimestre", "Production", "CA (FCFA)", "Employés"].join(","),
                ...filteredProductions.map((p) =>
                  [
                    getEnterpriseName(p.entrepriseId),
                    p.annee,
                    p.trimestre,
                    p.productionPhysique,
                    p.chiffreAffaires,
                    p.nombreEmployes,
                  ].join(",")
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `productions_${new Date().toISOString().split("T")[0]}.csv`;
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
            Nouvelle saisie
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-700 font-medium">
              Total productions
            </CardDescription>
            <CardTitle className="text-3xl text-emerald-900">
              {filteredProductions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">saisies enregistrées</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-700 font-medium">
              Production physique
            </CardDescription>
            <CardTitle className="text-3xl text-blue-900">
              {totalProduction.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">tonnes / unités</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 font-medium">
              Chiffre d'affaires
            </CardDescription>
            <CardTitle className="text-3xl text-amber-900">
              {totalCA.toLocaleString()} FCFA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-600">cumulé</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-700 font-medium">
              Emplois créés
            </CardDescription>
            <CardTitle className="text-3xl text-purple-900">
              {totalEmployes.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">employés au total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher entreprise, année..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterAnnee} onValueChange={setFilterAnnee}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les années" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les années</SelectItem>
                {ANNEES.map((a) => (
                  <SelectItem key={a} value={a.toString()}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTrimestre} onValueChange={setFilterTrimestre}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les trimestres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les trimestres</SelectItem>
                {TRIMESTRES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
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
            Historique des saisies
          </CardTitle>
          <CardDescription>
            {filteredProductions.length} résultat{filteredProductions.length > 1 ? "s" : ""} trouvé
            {filteredProductions.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProductions.length === 0 ? (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune production enregistrée</h3>
              <p className="text-muted-foreground mt-1">
                Commencez par ajouter votre première saisie trimestrielle.
              </p>
              <Button
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle saisie
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProductions.map((production) => (
                <div
                  key={production.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Factory className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {getEnterpriseName(production.entrepriseId)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {production.annee} - {production.trimestre}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getEnterpriseSector(production.entrepriseId)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">
                        {production.productionPhysique.toLocaleString()} unités
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {production.chiffreAffaires.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(production)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(production.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
