"use client";

import { useState, useEffect, FormEvent } from "react";

interface Enterprise {
  id: string;
  referenceSPI: string;
  denomination: string;
  sigle: string | null;
  secteurActivite: string;
  ville: string | null;
  region: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  nomContact: string | null;
  statut: string;
}

// ✅ TOUS LES SECTEURS complets (alignés avec le mapping et les données réelles)
const SECTEURS = [
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "AGRO-INDUSTRIE", label: "Agro-industrie" },
  { value: "ELEVAGE", label: "Élevage" },
  { value: "PECHE", label: "Pêche" },
  { value: "FORESTERIE", label: "Foresterie" },
  { value: "INDUSTRIE", label: "Industrie" },
  { value: "INDUSTRIE_LEGERE", label: "Industrie légère" },
  { value: "PHARMACEUTIQUE", label: "Pharmaceutique" },
  { value: "CHIMIE", label: "Chimie" },
  { value: "CHIMIE_PLASTIQUE", label: "Chimie / Plastique" },
  { value: "PLASTIQUE", label: "Plastique" },
  { value: "TEXTILE", label: "Textile" },
  { value: "TEXTILE_HABILLEMENT", label: "Textile / Habillement" },
  { value: "HABILLEMENT", label: "Habillement" },
  { value: "METALLURGIE", label: "Métallurgie" },
  { value: "BOIS", label: "Bois" },
  { value: "FORET_BOIS", label: "Forêt / Bois" },
  { value: "CIMENT", label: "Ciment" },
  { value: "ENERGIE", label: "Énergie" },
  { value: "MINES", label: "Mines" },
  { value: "SERVICES", label: "Services" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "INFORMATIQUE", label: "Informatique" },
  { value: "TELECOMMUNICATIONS", label: "Télécommunications" },
  { value: "TELECOMMUNICATIONS_IT", label: "Télécommunications / IT" },
  { value: "TELECOM", label: "Télécom" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "DISTRIBUTION", label: "Distribution" },
  { value: "IMPORT_EXPORT", label: "Import-Export" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "BATIMENT", label: "Bâtiment" },
  { value: "TRAVAUX_PUBLICS", label: "Travaux publics" },
  { value: "BTP", label: "BTP" },
  { value: "BTP_MATERIAUX", label: "BTP / Matériaux" },
  { value: "MATERIAUX", label: "Matériaux" },
  { value: "TECHNOLOGIE", label: "Technologie" },
  { value: "TECH", label: "Tech" },
  { value: "NUMERIQUE", label: "Numérique" },
  { value: "DIGITAL", label: "Digital" },
  { value: "IT", label: "IT" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "LOGISTIQUE", label: "Logistique" },
  { value: "TRANSPORT_LOGISTIQUE", label: "Transport / Logistique" },
  { value: "TOURISME", label: "Tourisme" },
  { value: "HOTELLERIE", label: "Hôtellerie" },
  { value: "RESTAURATION", label: "Restauration" },
  { value: "TOURISME_HOTELLERIE", label: "Tourisme / Hôtellerie" },
  { value: "SANTE", label: "Santé" },
  { value: "PHARMACIE", label: "Pharmacie" },
  { value: "MEDICAL", label: "Médical" },
  { value: "EDUCATION", label: "Éducation" },
  { value: "FORMATION", label: "Formation" },
  { value: "ENSEIGNEMENT", label: "Enseignement" },
  { value: "FINANCE", label: "Finance" },
  { value: "BANQUE", label: "Banque" },
  { value: "ASSURANCE", label: "Assurance" },
  { value: "MICROFINANCE", label: "Microfinance" },
  { value: "SECURITE_DEFENSE", label: "Sécurité / Défense" },
  { value: "ENVIRONNEMENT", label: "Environnement" },
  { value: "ENVIRONNEMENT_DECHETS", label: "Environnement / Déchets" },
  { value: "DECHETS", label: "Déchets" },
  { value: "AUTRE", label: "Autre" },
];

const REGIONS = [
  "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral",
  "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"
];

export default function EntreprisesPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSecteur, setFilterSecteur] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [userRole, setUserRole] = useState<string>("");

  // CRUD states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    denomination: "", sigle: "", secteurActivite: "AUTRE",
    ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
    anneeCreation: "", // ✅ NOUVEAU: Année de création
  });

  useEffect(() => {
    fetchAllData();
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setUserRole(data?.user?.role || "");
      }
    } catch (e) {
      console.error("Erreur session:", e);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/entreprises");
      if (res.ok) {
        const data = await res.json();
        setEnterprises(Array.isArray(data) ? data : []);
      } else {
        setEnterprises([]);
      }
    } catch (error) {
      console.error("Erreur fetch:", error);
      setEnterprises([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      denomination: "", sigle: "", secteurActivite: "AUTRE",
      ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
      anneeCreation: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (enterprise: Enterprise) => {
    setFormData({
      denomination: enterprise.denomination,
      sigle: enterprise.sigle || "",
      secteurActivite: enterprise.secteurActivite,
      ville: enterprise.ville || "",
      region: enterprise.region || "",
      adresse: enterprise.adresse || "",
      telephone: enterprise.telephone || "",
      email: enterprise.email || "",
      nomContact: enterprise.nomContact || "",
      anneeCreation: "", // Pas encore dans le modèle, à récupérer si ajouté
    });
    setEditingId(enterprise.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.denomination.trim()) {
      alert("La dénomination est obligatoire");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/entreprises/${editingId}` : "/api/entreprises";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editingId ? "Entreprise modifiée !" : "Entreprise ajoutée !");
        resetForm();
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Erreur lors de l'opération"));
      }
    } catch (error) {
      alert("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entreprise ? Cette action est irréversible.")) return;
    try {
      const res = await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Entreprise supprimée");
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Erreur lors de la suppression"));
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const handleValidate = async (id: string, statut: "ACTIF" | "REJETE") => {
    try {
      const res = await fetch(`/api/entreprises/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });

      if (res.ok) {
        alert(statut === "ACTIF" ? "Entreprise validée !" : "Entreprise rejetée.");
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Erreur lors de la validation"));
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  // Extraction des villes uniques pour le filtre
  const villesUniques = Array.from(new Set(
    enterprises
      .map(e => e.ville)
      .filter((v): v is string => !!v && v.trim() !== "")
      .sort()
  ));

  // Filtrage côté client
  const filteredEnterprises = enterprises.filter((e) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchSearch = !searchLower ||
      e.denomination.toLowerCase().includes(searchLower) ||
      (e.sigle && e.sigle.toLowerCase().includes(searchLower)) ||
      (e.ville && e.ville.toLowerCase().includes(searchLower)) ||
      (e.region && e.region.toLowerCase().includes(searchLower)) ||
      (e.adresse && e.adresse.toLowerCase().includes(searchLower)) ||
      (e.nomContact && e.nomContact.toLowerCase().includes(searchLower)) ||
      (e.telephone && e.telephone.includes(searchLower)) ||
      (e.email && e.email.toLowerCase().includes(searchLower));

    const matchSecteur = !filterSecteur ||
      e.secteurActivite.toUpperCase() === filterSecteur;
    const matchRegion = !filterRegion || e.region === filterRegion;
    const matchVille = !filterVille || e.ville === filterVille;

    return matchSearch && matchSecteur && matchRegion && matchVille;
  });

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAgent = userRole === "AGENT_SAISIE";

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #059669", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Chargement des entreprises...</p>
      </div>
    );
  }

  // ===== FORMULAIRE AJOUT/MODIFICATION =====
  if (showForm) {
    return (
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <button
          onClick={resetForm}
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", background: "none", border: "none", cursor: "pointer", color: "#374151", fontSize: "14px" }}
        >
          ← Retour à l'annuaire
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{ padding: "10px", background: "#dbeafe", borderRadius: "8px", fontSize: "24px" }}>🏢</div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>
              {editingId ? "Modifier l'entreprise" : "Ajouter une entreprise"}
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
              {isAgent ? "Saisie en attente de validation" : "Nouvelle fiche entreprise"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Identité */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              🏢 Identité de l'entreprise
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Dénomination <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text" required
                  placeholder="Nom de l'entreprise"
                  value={formData.denomination}
                  onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Sigle</label>
                <input
                  type="text"
                  placeholder="Sigle"
                  value={formData.sigle}
                  onChange={(e) => setFormData({ ...formData, sigle: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Secteur d'activité <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={formData.secteurActivite}
                  onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                >
                  {SECTEURS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  📅 Année de création
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="Ex: 2010"
                  value={formData.anneeCreation}
                  onChange={(e) => setFormData({ ...formData, anneeCreation: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

          {/* Localisation */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              📍 Localisation
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Région</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                >
                  <option value="">Non spécifiée</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Ville</label>
                <input
                  type="text"
                  placeholder="Ex: Yaoundé, Douala..."
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Adresse / BP</label>
                <input
                  type="text"
                  placeholder="Ex: BP 1234 Yaoundé..."
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

          {/* Contact */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              👤 Contact de l'entreprise
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>👤 Nom du contact</label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont..."
                  value={formData.nomContact}
                  onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>📞 Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex: +237 6XX XXX XXX"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>✉️ Email</label>
                <input
                  type="email"
                  placeholder="Ex: contact@entreprise.cm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
            <button
              type="button"
              onClick={resetForm}
              style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px", border: "none", borderRadius: "6px", background: "#059669",
                color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
                opacity: submitting ? 0.5 : 1
              }}
            >
              💾 {submitting ? "Enregistrement..." : (editingId ? "Modifier" : "Enregistrer")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ===== LISTE PRINCIPALE =====
  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", background: "#dbeafe", borderRadius: "8px", fontSize: "24px" }}>🏢</div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>Annuaire des Entreprises</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
              {enterprises.length} entreprises répertoriées · {filteredEnterprises.length} résultat{filteredEnterprises.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              const csv = [
                ["Référence SPI", "Dénomination", "Sigle", "Secteur", "Ville", "Région", "Téléphone", "Email", "Contact", "Statut"].join(";"),
                ...filteredEnterprises.map((e) => [
                  e.referenceSPI, e.denomination, e.sigle || "", e.secteurActivite, e.ville || "", e.region || "",
                  e.telephone || "", e.email || "", e.nomContact || "", e.statut
                ].join(";"))
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `entreprises_${new Date().toISOString().split("T")[0]}.csv`; a.click();
            }}
            style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            📥 Exporter CSV
          </button>
          {(isAdmin || isAgent) && (
            <button
              onClick={() => setShowForm(true)}
              style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              ➕ Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontWeight: "600", fontSize: "14px" }}>
          🔍 Recherche & Filtres
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher (nom, sigle, ville, contact, téléphone...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
          <select
            value={filterSecteur}
            onChange={(e) => setFilterSecteur(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
          >
            <option value="">Tous les secteurs</option>
            {SECTEURS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            value={filterRegion}
            onChange={(e) => { setFilterRegion(e.target.value); setFilterVille(""); }}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
          >
            <option value="">Toutes les régions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterVille}
            onChange={(e) => setFilterVille(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
          >
            <option value="">Toutes les villes</option>
            {villesUniques.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        {(searchTerm || filterSecteur || filterRegion || filterVille) && (
          <button
            onClick={() => { setSearchTerm(""); setFilterSecteur(""); setFilterRegion(""); setFilterVille(""); }}
            style={{ marginTop: "12px", padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "13px", color: "#6b7280" }}
          >
            🔄 Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Liste */}
      <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", background: "white" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", fontSize: "16px" }}>📋 Résultats</div>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>
              {filteredEnterprises.length} résultat{filteredEnterprises.length > 1 ? "s" : ""} sur {enterprises.length} entreprises
            </p>
          </div>
        </div>
        <div>
          {filteredEnterprises.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Aucune entreprise trouvée</h3>
              <p style={{ color: "#6b7280", margin: 0 }}>Ajustez vos filtres ou ajoutez une nouvelle entreprise.</p>
              {(isAdmin || isAgent) && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{ marginTop: "16px", padding: "10px 20px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  ➕ Ajouter une entreprise
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* En-tête du tableau */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 140px", padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <div>Entreprise</div>
                <div>Secteur</div>
                <div>Localisation</div>
                <div>Contact</div>
                <div>Statut</div>
                <div style={{ textAlign: "right" }}>Actions</div>
              </div>
              {filteredEnterprises.map((enterprise) => (
                <div
                  key={enterprise.id}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 140px",
                    padding: "16px", borderBottom: "1px solid #f3f4f6", alignItems: "center",
                    transition: "background 0.15s", cursor: "default"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Entreprise */}
                  <div>
                    <p style={{ fontWeight: "600", margin: 0, color: "#111827", fontSize: "14px" }}>{enterprise.denomination}</p>
                    {enterprise.sigle && <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>{enterprise.sigle}</p>}
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0 0" }}>Ref: {enterprise.referenceSPI}</p>
                  </div>

                  {/* Secteur */}
                  <div>
                    <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "500", background: "#f3f4f6", color: "#374151" }}>
                      {enterprise.secteurActivite}
                    </span>
                  </div>

                  {/* Localisation */}
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                      {enterprise.ville || "-"}
                    </p>
                    {enterprise.region && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#9ca3af" }}>{enterprise.region}</p>}
                  </div>

                  {/* Contact */}
                  <div>
                    {enterprise.nomContact && <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>{enterprise.nomContact}</p>}
                    {enterprise.telephone && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#6b7280" }}>📞 {enterprise.telephone}</p>}
                    {enterprise.email && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#6b7280" }}>✉️ {enterprise.email}</p>}
                    {!enterprise.nomContact && !enterprise.telephone && !enterprise.email && <span style={{ color: "#9ca3af", fontSize: "13px" }}>-</span>}
                  </div>

                  {/* Statut */}
                  <div>
                    <span style={{
                      padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "500",
                      background: enterprise.statut === "ACTIF" ? "#d1fae5" : enterprise.statut === "EN_ATTENTE" ? "#fef3c7" : "#fee2e2",
                      color: enterprise.statut === "ACTIF" ? "#059669" : enterprise.statut === "EN_ATTENTE" ? "#d97706" : "#dc2626"
                    }}>
                      {enterprise.statut === "ACTIF" ? "✅ Actif" : enterprise.statut === "EN_ATTENTE" ? "⏳ En attente" : "❌ Rejeté"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    {(isAdmin || isAgent) && (
                      <button
                        onClick={() => handleEdit(enterprise)}
                        title="Modifier"
                        style={{ padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", color: "#374151" }}
                      >
                        ✏️
                      </button>
                    )}

                    {isAdmin && enterprise.statut === "EN_ATTENTE" && (
                      <>
                        <button
                          onClick={() => handleValidate(enterprise.id, "ACTIF")}
                          title="Valider"
                          style={{ padding: "6px", border: "1px solid #059669", borderRadius: "6px", background: "#ecfdf5", cursor: "pointer", fontSize: "14px", color: "#059669" }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleValidate(enterprise.id, "REJETE")}
                          title="Rejeter"
                          style={{ padding: "6px", border: "1px solid #dc2626", borderRadius: "6px", background: "#fef2f2", cursor: "pointer", fontSize: "14px", color: "#dc2626" }}
                        >
                          ✕
                        </button>
                      </>
                    )}

                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(enterprise.id)}
                        title="Supprimer"
                        style={{ padding: "6px", border: "1px solid #ef4444", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}
                      >
                        🗑️
                      </button>
                    )}
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
