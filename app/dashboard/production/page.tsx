"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  Factory,
  Plus,
  Download,
  Search,
  BarChart3,
  Building2,
  Calendar,
  Package,
  DollarSign,
  Users,
  MessageSquare,
  Save,
  ArrowLeft,
  Pencil,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

interface Enterprise {
  id: string;
  denomination: string;
  sigle: string | null;
  secteurActivite: string;
}

interface Production {
  id: string;
  entrepriseId: string;
  annee: number | null;
  trimestre: number | null;
  productionPhysique: number | null;
  chiffreAffaires: number | null;
  effectifs: number | null;
  commentaire: string | null;
  statut: string;
  saisiePar: string | null;
  validePar: string | null;
  dateValidation: string | null;
  createdAt: string;
  entreprise?: {
    id: string;
    denomination: string;
    sigle: string | null;
    secteurActivite: string;
  };
  agentSaisie?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

function formatTrimestre(t: number | null): string {
  if (!t) return "-";
  const map: Record<number, string> = { 1: "T1", 2: "T2", 3: "T3", 4: "T4" };
  return map[t] || "T" + t;
}

// Conversion: Millions de tonnes <-> tonnes
const TONNES_FACTOR = 1000000;
// Conversion: Milliards de FCFA <-> FCFA
const FCFA_FACTOR = 1000000000;

export default function ProductionPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const userId = session?.user?.id || "";
  const isAgent = userRole === "AGENT_SAISIE";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  const [showForm, setShowForm] = useState(false);
  const [productions, setProductions] = useState<Production[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    entrepriseId: "",
    annee: "2026",
    trimestre: "T1",
    productionPhysique: "", // en Millions de tonnes
    chiffreAffaires: "", // en Milliards de FCFA
    nombreEmployes: "",
    commentaire: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const entRes = await fetch("/api/entreprises");
      if (entRes.ok) {
        const entData = await entRes.json();
        const entList = Array.isArray(entData) ? entData : (entData.entreprises || []);
        setEnterprises(entList);
      } else {
        setMessage("Erreur chargement entreprises");
      }

      const prodUrl = isAgent ? "/api/productions?mesProductions=true" : "/api/productions";
      const prodRes = await fetch(prodUrl);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const prodList = Array.isArray(prodData) ? prodData : (prodData.productions || []);
        setProductions(prodList);
      } else {
        setMessage("Erreur chargement productions");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      entrepriseId: "", annee: "2026", trimestre: "T1",
      productionPhysique: "", chiffreAffaires: "", nombreEmployes: "", commentaire: "",
    });
    setEditingProduction(null);
    setShowForm(false);
  };

  const handleEdit = (production: Production) => {
    if (isAgent && production.statut !== "EN_ATTENTE") {
      alert("Vous ne pouvez modifier que les productions en attente de validation.");
      return;
    }

    setEditingProduction(production);
    setFormData({
      entrepriseId: production.entrepriseId,
      annee: production.annee?.toString() || "2026",
      trimestre: formatTrimestre(production.trimestre),
      // Convertir tonnes -> Millions de tonnes
      productionPhysique: production.productionPhysique
        ? (production.productionPhysique / TONNES_FACTOR).toString()
        : "",
      // Convertir FCFA -> Milliards de FCFA
      chiffreAffaires: production.chiffreAffaires
        ? (production.chiffreAffaires / FCFA_FACTOR).toString()
        : "",
      nombreEmployes: production.effectifs?.toString() || "",
      commentaire: production.commentaire || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.entrepriseId) {
      alert("Veuillez selectionner une entreprise");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingProduction ? `/api/productions/${editingProduction.id}` : "/api/productions";
      const method = editingProduction ? "PATCH" : "POST";

      // Convertir les valeurs saisies en unités de base avant envoi
      const productionPhysiqueTonnes = parseFloat(formData.productionPhysique) * TONNES_FACTOR;
      const chiffreAffairesFCFA = parseFloat(formData.chiffreAffaires) * FCFA_FACTOR;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrepriseId: formData.entrepriseId,
          annee: parseInt(formData.annee),
          trimestre: formData.trimestre,
          productionPhysique: productionPhysiqueTonnes || 0,
          chiffreAffaires: chiffreAffairesFCFA || 0,
          effectifs: parseInt(formData.nombreEmployes) || 0,
          commentaire: formData.commentaire,
        }),
      });

      if (res.ok) {
        alert(editingProduction ? "Production modifiee !" : "Production enregistree !");
        resetForm();
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Erreur lors de l'enregistrement"));
      }
    } catch (error) {
      alert("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette production ?")) return;
    try {
      const res = await fetch(`/api/productions/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Production supprimee");
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Suppression non autorisee"));
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const handleValidate = async (id: string, statut: "VALIDE" | "REJETE") => {
    try {
      const res = await fetch(`/api/productions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });

      if (res.ok) {
        alert(statut === "VALIDE" ? "Production validee !" : "Production rejetee.");
        setValidatingId(null);
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Erreur lors de la validation"));
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const getEnterpriseName = (id: string) => {
    const ent = enterprises.find((e) => e.id === id);
    return ent ? ent.denomination + (ent.sigle ? " (" + ent.sigle + ")" : "") : "Entreprise inconnue";
  };

  const getEnterpriseSecteur = (id: string) => {
    const ent = enterprises.find((e) => e.id === id);
    return ent?.secteurActivite || "N/A";
  };

  const visibleProductions = Array.isArray(productions)
    ? productions.filter((p) => {
        if (isAgent && p.saisiePar && p.saisiePar !== userId) return false;
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return getEnterpriseName(p.entrepriseId).toLowerCase().includes(searchLower) ||
          formatTrimestre(p.trimestre).toLowerCase().includes(searchLower) ||
          (p.annee?.toString() || "").includes(searchTerm);
      })
    : [];

  const totalProduction = visibleProductions.reduce((sum, p) => sum + (p.productionPhysique || 0), 0);
  const totalCA = visibleProductions.reduce((sum, p) => sum + (p.chiffreAffaires || 0), 0);
  const totalEmployes = visibleProductions.reduce((sum, p) => sum + (p.effectifs || 0), 0);

  const enAttenteCount = visibleProductions.filter(p => p.statut === "EN_ATTENTE").length;
  const valideCount = visibleProductions.filter(p => p.statut === "VALIDE").length;
  const rejeteCount = visibleProductions.filter(p => p.statut === "REJETE").length;

  if (loading) {
    return (
      <div style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "20px", height: "20px", border: "3px solid #e5e7eb", borderTop: "3px solid #059669", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <button
          onClick={() => resetForm()}
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", background: "none", border: "none", cursor: "pointer", color: "#374151", fontSize: "14px" }}
        >
          <ArrowLeft size={16} /> Retour aux productions
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{ padding: "10px", background: "#d1fae5", borderRadius: "8px" }}>
            <Factory size={28} color="#059669" />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>
              {editingProduction ? "Modifier la saisie" : "Nouvelle saisie"}
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Production trimestrielle</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "600", color: "#374151" }}>
              <Building2 size={18} /> Entreprise
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                Selectionner une entreprise <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={formData.entrepriseId}
                onChange={(e) => setFormData({ ...formData, entrepriseId: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                disabled={!!editingProduction}
              >
                <option value="">Choisir une entreprise...</option>
                {enterprises.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.denomination}{ent.sigle ? " (" + ent.sigle + ")" : ""}
                  </option>
                ))}
              </select>
              {formData.entrepriseId && (
                <div style={{ marginTop: "8px", padding: "8px 12px", background: "#f9fafb", borderRadius: "6px", fontSize: "13px", color: "#6b7280" }}>
                  <span style={{ padding: "2px 8px", background: "#e5e7eb", borderRadius: "4px", fontSize: "12px", marginRight: "8px" }}>
                    {getEnterpriseSecteur(formData.entrepriseId)}
                  </span>
                  {getEnterpriseName(formData.entrepriseId)}
                </div>
              )}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "600", color: "#374151" }}>
              <Calendar size={18} /> Periode
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Annee <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={formData.annee}
                  onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Trimestre <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={formData.trimestre}
                  onChange={(e) => setFormData({ ...formData, trimestre: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                >
                  <option value="T1">T1 (Janvier - Mars)</option>
                  <option value="T2">T2 (Avril - Juin)</option>
                  <option value="T3">T3 (Juillet - Septembre)</option>
                  <option value="T4">T4 (Octobre - Decembre)</option>
                </select>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "600", color: "#374151" }}>
              <BarChart3 size={18} /> Donnees de production
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {/* Production physique - Millions de tonnes */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  <Package size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Production physique
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.productionPhysique}
                    onChange={(e) => setFormData({ ...formData, productionPhysique: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  />
                  <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>
                    Mt
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Millions de tonnes</p>
              </div>

              {/* Chiffre d'affaires - Milliards de FCFA */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  <DollarSign size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Chiffre d&apos;affaires
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.chiffreAffaires}
                    onChange={(e) => setFormData({ ...formData, chiffreAffaires: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  />
                  <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>
                    Gd FCFA
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Milliards de FCFA</p>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  <Users size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Nombre d&apos;employes
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.nombreEmployes}
                  onChange={(e) => setFormData({ ...formData, nombreEmployes: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>effectif total</p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
              <MessageSquare size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Commentaire (optionnel)
            </label>
            <textarea
              placeholder="Notes additionnelles..."
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "16px" }}>
            <button
              type="button"
              onClick={() => resetForm()}
              style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.entrepriseId}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                background: "#059669",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: submitting || !formData.entrepriseId ? 0.5 : 1
              }}
            >
              <Save size={16} /> {submitting ? "Enregistrement..." : (editingProduction ? "Modifier" : "Enregistrer")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {message && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: "#fee2e2", color: "#dc2626", fontSize: "14px" }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", background: "#d1fae5", borderRadius: "8px" }}>
            <Factory size={28} color="#059669" />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>Production</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Gestion des saisies trimestrielles</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              const csv = [
                ["Entreprise", "Annee", "Trimestre", "Production", "CA (FCFA)", "Employes", "Statut"].join(","),
                ...visibleProductions.map((p) => [
                  getEnterpriseName(p.entrepriseId), p.annee || "", formatTrimestre(p.trimestre),
                  p.productionPhysique || 0, p.chiffreAffaires || 0, p.effectifs || 0, p.statut || "EN_ATTENTE"
                ].join(","))
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = "productions_" + new Date().toISOString().split("T")[0] + ".csv"; a.click();
            }}
            style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={16} /> Exporter CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Nouvelle saisie
          </button>
        </div>
      </div>

      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #fef3c7", background: "#fef3c7", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#d97706" }}>{enAttenteCount}</p>
            <p style={{ fontSize: "12px", color: "#92400e", margin: "4px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <Clock size={12} /> En attente
            </p>
          </div>
          <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1fae5", background: "#d1fae5", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#059669" }}>{valideCount}</p>
            <p style={{ fontSize: "12px", color: "#065f46", margin: "4px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <CheckCircle2 size={12} /> Valides
            </p>
          </div>
          <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fee2e2", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#dc2626" }}>{rejeteCount}</p>
            <p style={{ fontSize: "12px", color: "#991b1b", margin: "4px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <XCircle size={12} /> Rejetes
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total productions", value: visibleProductions.length, sub: "saisies enregistrees", color: "#059669", bg: "#d1fae5" },
          { label: "Production physique", value: (totalProduction / TONNES_FACTOR).toLocaleString() + " Mt", sub: "millions de tonnes", color: "#2563eb", bg: "#dbeafe" },
          { label: "Chiffre d&apos;affaires", value: (totalCA / FCFA_FACTOR).toLocaleString() + " Gd FCFA", sub: "milliards de FCFA", color: "#d97706", bg: "#fef3c7" },
          { label: "Emplois crees", value: totalEmployes.toLocaleString(), sub: "employes au total", color: "#7c3aed", bg: "#ede9fe" },
        ].map((item) => (
          <div key={item.label} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "linear-gradient(135deg, " + item.bg + ", white)" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: item.color, margin: "0 0 8px 0" }}>{item.label}</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: 0 }}>{item.value}</p>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>{item.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontWeight: "600", fontSize: "14px" }}>
          <Search size={16} /> Filtres
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>
              <Search size={16} color="#9ca3af" />
            </span>
            <input
              type="text"
              placeholder="Rechercher entreprise, annee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
        </div>
      </div>

      <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", background: "white" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            <BarChart3 size={16} /> Historique des saisies
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>{visibleProductions.length} resultat{visibleProductions.length > 1 ? "s" : ""}</p>
        </div>
        <div style={{ padding: "16px" }}>
          {visibleProductions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                <Factory size={48} color="#9ca3af" />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Aucune production enregistree</h3>
              <p style={{ color: "#6b7280", margin: 0 }}>Commencez par ajouter votre premiere saisie.</p>
              <button
                onClick={() => setShowForm(true)}
                style={{ marginTop: "16px", padding: "10px 20px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={16} /> Nouvelle saisie
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {visibleProductions.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <div style={{ padding: "8px", background: "#d1fae5", borderRadius: "6px" }}>
                      <Factory size={20} color="#059669" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "600", margin: 0, color: "#111827" }}>{getEnterpriseName(p.entrepriseId)}</p>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 8px", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "12px" }}>
                          {(p.annee || "") + " - " + formatTrimestre(p.trimestre)}
                        </span>
                        <span style={{ padding: "2px 8px", background: "#f3f4f6", borderRadius: "4px", fontSize: "12px" }}>
                          {getEnterpriseSecteur(p.entrepriseId)}
                        </span>
                        {p.statut && (
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            background: p.statut === "VALIDE" ? "#d1fae5" : p.statut === "EN_ATTENTE" ? "#fef3c7" : "#fee2e2",
                            color: p.statut === "VALIDE" ? "#059669" : p.statut === "EN_ATTENTE" ? "#d97706" : "#dc2626"
                          }}>
                            {p.statut === "VALIDE" ? (
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={12} /> Valide</span>
                            ) : p.statut === "EN_ATTENTE" ? (
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> En attente</span>
                            ) : (
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><XCircle size={12} /> Rejete</span>
                            )}
                          </span>
                        )}
                      </div>
                      {p.commentaire && (
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0 0", fontStyle: "italic" }}>
                          <MessageSquare size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> {p.commentaire}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ textAlign: "right", marginRight: "8px" }}>
                      <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>{(p.productionPhysique ? (p.productionPhysique / TONNES_FACTOR).toLocaleString() : "0")} Mt</p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>{(p.chiffreAffaires ? (p.chiffreAffaires / FCFA_FACTOR).toLocaleString() : "0")} Gd FCFA</p>
                      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0 0" }}>{(p.effectifs || 0).toLocaleString()} employes</p>
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                      {(isAdmin || (isAgent && p.statut === "EN_ATTENTE")) && (
                        <button
                          onClick={() => handleEdit(p)}
                          title="Modifier"
                          style={{ padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px" }}
                        >
                          <Pencil size={14} color="#374151" />
                        </button>
                      )}

                      {(isAdmin || (isAgent && p.statut === "EN_ATTENTE")) && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Supprimer"
                          style={{ padding: "6px", border: "1px solid #ef4444", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {isAdmin && p.statut === "EN_ATTENTE" && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          {validatingId === p.id ? (
                            <>
                              <button
                                onClick={() => handleValidate(p.id, "VALIDE")}
                                style={{ padding: "6px 12px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                <CheckCircle2 size={12} /> Valider
                              </button>
                              <button
                                onClick={() => handleValidate(p.id, "REJETE")}
                                style={{ padding: "6px 12px", border: "none", borderRadius: "6px", background: "#dc2626", color: "white", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                <XCircle size={12} /> Rejeter
                              </button>
                              <button
                                onClick={() => setValidatingId(null)}
                                style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "12px" }}
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setValidatingId(p.id)}
                              style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <Settings size={12} /> Valider
                            </button>
                          )}
                        </div>
                      )}
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
