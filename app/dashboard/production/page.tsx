"use client";

import { useState, useEffect, FormEvent } from "react";

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
  trimestre: string;
  productionPhysique: number;
  chiffreAffaires: number;
  effectifs: number;
  commentaire?: string | null;
  commentaireValidation?: string | null;
  statut?: string;
  saisiePar?: string;
  validePar?: string | null;
  dateValidation?: string | null;
}

export default function ProductionPage() {
  const [showForm, setShowForm] = useState(false);
  const [productions, setProductions] = useState<Production[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationComment, setValidationComment] = useState("");

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

  // ✅ Charger toutes les entreprises avec pagination + productions + rôle utilisateur
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Charger toutes les entreprises avec pagination
      let allEnterprises: Enterprise[] = [];
      let page = 1;
      let hasMore = true;
      const limit = 100;

      while (hasMore) {
        const entRes = await fetch(`/api/entreprises?page=${page}&limit=${limit}`);
        if (entRes.ok) {
          const entData = await entRes.json();
          const entList = entData.entreprises || [];
          allEnterprises = [...allEnterprises, ...entList];
          hasMore = entList.length === limit && page < (entData.totalPages || 1);
          page++;
          if (page > 10) hasMore = false;
        } else {
          hasMore = false;
        }
      }

      setEnterprises(Array.isArray(allEnterprises) ? allEnterprises : []);

      // Charger les productions
      const prodRes = await fetch("/api/production");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const prodList = prodData.productions || prodData;
        setProductions(Array.isArray(prodList) ? prodList : []);
      }

      // Récupérer le rôle de l'utilisateur
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setUserRole(sessionData?.user?.role || "");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.entrepriseId) {
      alert("Veuillez sélectionner une entreprise");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/production", {
        method: "POST",
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
        alert("Production enregistrée !");
        setShowForm(false);
        setFormData({
          entrepriseId: "", annee: "2026", trimestre: "T1",
          productionPhysique: "", chiffreAffaires: "", nombreEmployes: "", commentaire: "",
        });
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
        alert("Erreur");
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  // ✅ NOUVEAU : Valider une production
  const handleValidate = async (id: string, statut: "VALIDE" | "REJETE") => {
    try {
      const res = await fetch(`/api/production/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statut,
          commentaireValidation: validationComment,
        }),
      });

      if (res.ok) {
        alert(statut === "VALIDE" ? "Production validée !" : "Production rejetée.");
        setValidatingId(null);
        setValidationComment("");
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
    if (!Array.isArray(enterprises)) return "Entreprise inconnue";
    const ent = enterprises.find((e) => e.id === id);
    return ent ? `${ent.denomination}${ent.sigle ? ` (${ent.sigle})` : ""}` : "Entreprise inconnue";
  };

  const getEnterpriseSecteur = (id: string) => {
    if (!Array.isArray(enterprises)) return "N/A";
    const ent = enterprises.find((e) => e.id === id);
    return ent?.secteurActivite || "N/A";
  };

  const filteredProductions = Array.isArray(productions) 
    ? productions.filter((p) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return getEnterpriseName(p.entrepriseId).toLowerCase().includes(searchLower) ||
          p.trimestre.toLowerCase().includes(searchLower) ||
          p.annee.toString().includes(searchLower);
      })
    : [];

  const totalProduction = filteredProductions.reduce((sum, p) => sum + (p.productionPhysique || 0), 0);
  const totalCA = filteredProductions.reduce((sum, p) => sum + (p.chiffreAffaires || 0), 0);
  const totalEmployes = filteredProductions.reduce((sum, p) => sum + (p.effectifs || 0), 0);

  // Compteurs par statut
  const enAttenteCount = productions.filter(p => p.statut === "EN_ATTENTE").length;
  const valideCount = productions.filter(p => p.statut === "VALIDE").length;
  const rejeteCount = productions.filter(p => p.statut === "REJETE").length;

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

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

  // Formulaire
  if (showForm) {
    return (
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <button
          onClick={() => setShowForm(false)}
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", background: "none", border: "none", cursor: "pointer", color: "#374151", fontSize: "14px" }}
        >
          ← Retour aux productions
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{ padding: "10px", background: "#d1fae5", borderRadius: "8px", fontSize: "24px" }}>🏭</div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>Nouvelle saisie</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Production trimestrielle</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section Entreprise */}
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
              >
                <option value="">Choisir une entreprise...</option>
                {Array.isArray(enterprises) && enterprises.map((ent) => (
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

          {/* Section Période */}
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

          {/* Section Données */}
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

          {/* Commentaire */}
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
              onClick={() => setShowForm(false)}
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
              💾 {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Liste
  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
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
                ...filteredProductions.map((p) => [
                  getEnterpriseName(p.entrepriseId), p.annee, p.trimestre,
                  p.productionPhysique, p.chiffreAffaires, p.effectifs, p.statut || "EN_ATTENTE"
                ].join(","))
              ].join("\n");
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

      {/* ✅ NOUVEAU : Compteurs par statut (visible pour Admin) */}
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

      {/* Compteurs généraux */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total productions", value: filteredProductions.length, sub: "saisies enregistrées", color: "#059669", bg: "#d1fae5" },
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

      {/* Filtres */}
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

      {/* Liste */}
      <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", background: "white" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            📊 Historique des saisies
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>{filteredProductions.length} résultat{filteredProductions.length > 1 ? "s" : ""}</p>
        </div>
        <div style={{ padding: "16px" }}>
          {filteredProductions.length === 0 ? (
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
              {filteredProductions.map((p) => (
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
                          {p.annee} - {p.trimestre}
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
                      {p.commentaireValidation && (
                        <p style={{ fontSize: "12px", color: "#dc2626", margin: "4px 0 0 0", fontStyle: "italic" }}>
                          📝 Commentaire validation: {p.commentaireValidation}
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

                    {/* ✅ NOUVEAU : Boutons Valider/Rejeter pour Admin */}
                    {isAdmin && p.statut === "EN_ATTENTE" && (
                      <div style={{ display: "flex", gap: "4px" }}>
                        {validatingId === p.id ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <input
                              type="text"
                              placeholder="Commentaire (optionnel)"
                              value={validationComment}
                              onChange={(e) => setValidationComment(e.target.value)}
                              style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", width: "150px" }}
                            />
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => handleValidate(p.id, "VALIDE")}
                                style={{ padding: "4px 8px", border: "none", borderRadius: "4px", background: "#059669", color: "white", cursor: "pointer", fontSize: "11px" }}
                              >
                                ✅ Valider
                              </button>
                              <button
                                onClick={() => handleValidate(p.id, "REJETE")}
                                style={{ padding: "4px 8px", border: "none", borderRadius: "4px", background: "#dc2626", color: "white", cursor: "pointer", fontSize: "11px" }}
                              >
                                ❌ Rejeter
                              </button>
                              <button
                                onClick={() => { setValidatingId(null); setValidationComment(""); }}
                                style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "11px" }}
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
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

                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ padding: "6px", border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontSize: "16px" }}
                    >
                      🗑️
                    </button>
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
