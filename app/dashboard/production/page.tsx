"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";

interface Enterprise {
  id: string;
  denomination: string;
  sigle: string | null;
  secteurActivite: string;
}

interface Production {
  id: string;
  entrepriseId: string;
  annee: number;
  trimestre: number;
  productionPhysique: number;
  chiffreAffaires: number;
  effectifs: number;
  commentaire?: string | null;
  statut?: string;
  saisiePar?: string;
  validePar?: string | null;
  dateValidation?: string | null;
  createdAt?: string;
}

function formatTrimestre(t: number): string {
  const map: Record<number, string> = { 1: "T1", 2: "T2", 3: "T3", 4: "T4" };
  return map[t] || `T${t}`;
}

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

  const [formData, setFormData] = useState({
    entrepriseId: "",
    annee: "2026",
    trimestre: "T1",
    productionPhysique: "",
    chiffreAffaires: "",
    nombreEmployes: "",
    commentaire: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // ✅ FIX: Appel sans pagination — la route retourne un tableau direct
      const entRes = await fetch("/api/entreprises");
      if (entRes.ok) {
        const entData = await entRes.json();
        // La route retourne un tableau direct ou un objet avec entreprises
        const entList = Array.isArray(entData) ? entData : (entData.entreprises || []);
        setEnterprises(entList);
      }

      // ✅ FIX: Récupérer les productions selon le rôle
      const prodUrl = isAgent ? "/api/production?mesProductions=true" : "/api/production";
      const prodRes = await fetch(prodUrl);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const prodList = Array.isArray(prodData) ? prodData : (prodData.productions || []);
        setProductions(prodList);
      }
    } catch (error) {
      console.error("Erreur:", error);
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
    // Agent ne peut modifier que ses propres productions EN_ATTENTE
    if (isAgent && production.statut !== "EN_ATTENTE") {
      alert("Vous ne pouvez modifier que les productions en attente de validation.");
      return;
    }

    setEditingProduction(production);
    setFormData({
      entrepriseId: production.entrepriseId,
      annee: production.annee.toString(),
      trimestre: formatTrimestre(production.trimestre),
      productionPhysique: production.productionPhysique?.toString() || "",
      chiffreAffaires: production.chiffreAffaires?.toString() || "",
      nombreEmployes: production.effectifs?.toString() || "",
      commentaire: production.commentaire || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.entrepriseId) {
      alert("Veuillez sélectionner une entreprise");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingProduction ? `/api/production/${editingProduction.id}` : "/api/production";
      const method = editingProduction ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrepriseId: formData.entrepriseId,
          annee: parseInt(formData.annee),
          trimestre: formData.trimestre,
          productionPhysique: parseFloat(formData.productionPhysique) || 0,
          chiffreAffaires: parseFloat(formData.chiffreAffaires) || 0,
          effectifs: parseInt(formData.nombreEmployes) || 0,
          commentaire: formData.commentaire,
        }),
      });

      if (res.ok) {
        alert(editingProduction ? "Production modifiée !" : "Production enregistrée !");
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
      const res = await fetch(`/api/production/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Production supprimée");
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Suppression non autorisée"));
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const handleValidate = async (id: string, statut: "VALIDE" | "REJETE") => {
    try {
      const res = await fetch(`/api/production/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });

      if (res.ok) {
        alert(statut === "VALIDE" ? "Production validée !" : "Production rejetée.");
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
    return ent ? `${ent.denomination}${ent.sigle ? ` (${ent.sigle})` : ""}` : "Entreprise inconnue";
  };

  const getEnterpriseSecteur = (id: string) => {
    const ent = enterprises.find((e) => e.id === id);
    return ent?.secteurActivite || "N/A";
  };

  // ✅ Agent ne voit que ses propres productions (filtrage côté client en plus de l'API)
  const visibleProductions = Array.isArray(productions)
    ? productions.filter((p) => {
        if (isAgent && p.saisiePar && p.saisiePar !== userId) return false;
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return getEnterpriseName(p.entrepriseId).toLowerCase().includes(searchLower) ||
          formatTrimestre(p.trimestre).toLowerCase().includes(searchLower) ||
          p.annee.toString().includes(searchLower);
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
          ← Retour aux productions
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{ padding: "10px", background: "#d1fae5", borderRadius: "8px", fontSize: "24px" }}>🏭</div>
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
              🏢 Entreprise
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                Sélectionner une entreprise <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={formData.entrepriseId}
                onChange={(e) => setFormData({ ...formData, entrepriseId: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                disabled={!!editingProduction}
              >
                <option value="">Choisir une entreprise...</option>
                {enterprises.map((ent) => (
                  <option key={ent.id} value={ent.id}>{ent.denomination}{ent.sigle ? ` (${ent.sigle})` : ""}</option>
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
              📅 Période
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Année <span style={{ color: "#ef4444" }}>*</span>
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
                  <option value="T4">T4 (Octobre - Décembre)</option>
                </select>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "600", color: "#374151" }}>
              📊 Données de production
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  📦 Production physique
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.productionPhysique}
                  onChange={(e) => setFormData({ ...formData, productionPhysique: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>tonnes, unités, etc.</p>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  💰 Chiffre d'affaires
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.chiffreAffaires}
                  onChange={(e) => setFormData({ ...formData, chiffreAffaires: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>en FCFA</p>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  👥 Nombre d'employés
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
              💬 Commentaire (optionnel)
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
              💾 {submitting ? "Enregistrement..." : (editingProduction ? "Modifier" : "Enregistrer")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", background: "#d1fae5", borderRadius: "8px", fontSize: "24px" }}>🏭</div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>Production</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Gestion des saisies trimestrielles</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              const csv = [
                ["Entreprise", "Année", "Trimestre", "Production", "CA (FCFA)", "Employés", "Statut"].join(","),
                ...visibleProductions.map((p) => [
                  getEnterpriseName(p.entrepriseId), p.annee, formatTrimestre(p.trimestre),
                  p.productionPhysique, p.chiffreAffaires, p.effectifs, p.statut || "EN_ATTENTE"
                ].join(","))
              ].join("
");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `productions_${new Date().toISOString().split("T")[0]}.csv`; a.click();
            }}
            style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            📥 Exporter CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ➕ Nouvelle saisie
          </button>
        </div>
      </div>

      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #fef3c7", background: "#fef3c7", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#d97706" }}>{enAttenteCount}</p>
            <p style={{ fontSize: "12px", color: "#92400e", margin: "4px 0 0 0" }}>⏳ En attente</p>
          </div>
          <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1fae5", background: "#d1fae5", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#059669" }}>{valideCount}</p>
            <p style={{ fontSize: "12px", color: "#065f46", margin: "4px 0 0 0" }}>✅ Validés</p>
          </div>
          <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fee2e2", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#dc2626" }}>{rejeteCount}</p>
            <p style={{ fontSize: "12px", color: "#991b1b", margin: "4px 0 0 0" }}>❌ Rejetés</p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total productions", value: visibleProductions.length, sub: "saisies enregistrées", color: "#059669", bg: "#d1fae5" },
          { label: "Production physique", value: totalProduction.toLocaleString(), sub: "tonnes / unités", color: "#2563eb", bg: "#dbeafe" },
          { label: "Chiffre d'affaires", value: `${totalCA.toLocaleString()} FCFA`, sub: "cumulé", color: "#d97706", bg: "#fef3c7" },
          { label: "Emplois créés", value: totalEmployes.toLocaleString(), sub: "employés au total", color: "#7c3aed", bg: "#ede9fe" },
        ].map((item) => (
          <div key={item.label} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: `linear-gradient(135deg, ${item.bg}, white)` }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: item.color, margin: "0 0 8px 0" }}>{item.label}</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: 0 }}>{item.value}</p>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>{item.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontWeight: "600", fontSize: "14px" }}>
          🔍 Filtres
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher entreprise, année..."
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
            📊 Historique des saisies
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>{visibleProductions.length} résultat{visibleProductions.length > 1 ? "s" : ""}</p>
        </div>
        <div style={{ padding: "16px" }}>
          {visibleProductions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏭</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Aucune production enregistrée</h3>
              <p style={{ color: "#6b7280", margin: 0 }}>Commencez par ajouter votre première saisie.</p>
              <button
                onClick={() => setShowForm(true)}
                style={{ marginTop: "16px", padding: "10px 20px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                ➕ Nouvelle saisie
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
                    <div style={{ padding: "8px", background: "#d1fae5", borderRadius: "6px", fontSize: "18px" }}>🏭</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "600", margin: 0, color: "#111827" }}>{getEnterpriseName(p.entrepriseId)}</p>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 8px", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "12px" }}>
                          {p.annee} - {formatTrimestre(p.trimestre)}
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
                            {p.statut === "VALIDE" ? "✅ Validé" : p.statut === "EN_ATTENTE" ? "⏳ En attente" : "❌ Rejeté"}
                          </span>
                        )}
                      </div>
                      {p.commentaire && (
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0 0", fontStyle: "italic" }}>
                          💬 {p.commentaire}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ textAlign: "right", marginRight: "8px" }}>
                      <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>{(p.productionPhysique || 0).toLocaleString()} unités</p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>{(p.chiffreAffaires || 0).toLocaleString()} FCFA</p>
                      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0 0" }}>{(p.effectifs || 0).toLocaleString()} employés</p>
                    </div>

                    {/* Boutons d'action */}
                    <div style={{ display: "flex", gap: "4px" }}>
                      {/* Modifier — Agent peut modifier ses EN_ATTENTE, Admin peut tout */}
                      {(isAdmin || (isAgent && p.statut === "EN_ATTENTE")) && (
                        <button
                          onClick={() => handleEdit(p)}
                          title="Modifier"
                          style={{ padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px" }}
                        >
                          ✏️
                        </button>
                      )}

                      {/* Supprimer — Agent peut supprimer ses EN_ATTENTE, Admin peut tout */}
                      {(isAdmin || (isAgent && p.statut === "EN_ATTENTE")) && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Supprimer"
                          style={{ padding: "6px", border: "1px solid #ef4444", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}
                        >
                          🗑️
                        </button>
                      )}

                      {/* Valider/Rejeter — ADMIN/SUPER_ADMIN uniquement */}
                      {isAdmin && p.statut === "EN_ATTENTE" && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          {validatingId === p.id ? (
                            <>
                              <button
                                onClick={() => handleValidate(p.id, "VALIDE")}
                                style={{ padding: "6px 12px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "12px" }}
                              >
                                ✅ Valider
                              </button>
                              <button
                                onClick={() => handleValidate(p.id, "REJETE")}
                                style={{ padding: "6px 12px", border: "none", borderRadius: "6px", background: "#dc2626", color: "white", cursor: "pointer", fontSize: "12px" }}
                              >
                                ❌ Rejeter
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
                              style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "12px", color: "#374151" }}
                            >
                              ⚙️ Valider
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
