"use client";

import { useState, useEffect, FormEvent } from "react";

interface Enterprise {
  id: string;
  denomination: string;
  sigle: string | null;
  description: string | null;
  secteurActivite: string;
  ville: string | null;
  region: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  nomContact: string | null;
}

// ✅ MAPPING COMPLET : Secteurs réels du Cameroun → Catégories du frontend
// ⚠️ AUCUN DOUBLON de clé autorisé !
const SECTEUR_MAPPING: Record<string, string> = {
  // === AGRICULTURE 🌾 ===
  "AGRICULTURE": "AGRICULTURE",
  "AGROALIMENTAIRE": "AGRICULTURE",
  "AGRO-ALIMENTAIRE": "AGRICULTURE",
  "AGRO INDUSTRIE": "AGRICULTURE",
  "AGRO-INDUSTRIE": "AGRICULTURE",
  "AGRICULTURE / AGRO-INDUSTRIE": "AGRICULTURE",
  "AGRICULTURE/AGRO-INDUSTRIE": "AGRICULTURE",
  "ELEVAGE": "AGRICULTURE",
  "PECHE": "AGRICULTURE",
  "FORESTERIE": "AGRICULTURE",

  // === INDUSTRIE 🏭 ===
  "INDUSTRIE": "INDUSTRIE",
  "INDUSTRIE LÉGÈRE": "INDUSTRIE",
  "INDUSTRIE LEGERE": "INDUSTRIE",
  "PHARMACEUTIQUE": "INDUSTRIE",
  "CHIMIE": "INDUSTRIE",
  "CHIMIE / PLASTIQUE": "INDUSTRIE",
  "CHIMIE/PLASTIQUE": "INDUSTRIE",
  "PLASTIQUE": "INDUSTRIE",
  "TEXTILE": "INDUSTRIE",
  "TEXTILE / HABILLEMENT": "INDUSTRIE",
  "TEXTILE/HABILLEMENT": "INDUSTRIE",
  "HABILLEMENT": "INDUSTRIE",
  "MÉTALLURGIE": "INDUSTRIE",
  "METALLURGIE": "INDUSTRIE",
  "BOIS": "INDUSTRIE",
  "FORÊT / BOIS": "INDUSTRIE",
  "FORET / BOIS": "INDUSTRIE",
  "FORÊT/BOIS": "INDUSTRIE",
  "CIMENT": "INDUSTRIE",
  "ÉNERGIE": "INDUSTRIE",
  "ENERGIE": "INDUSTRIE",
  "MINES": "INDUSTRIE",

  // === SERVICES 💼 ===
  "SERVICES": "SERVICES",
  "CONSULTING": "SERVICES",
  "INFORMATIQUE": "SERVICES",
  "TÉLÉCOMMUNICATIONS / IT": "SERVICES",
  "TELECOMMUNICATIONS / IT": "SERVICES",
  "TÉLÉCOMMUNICATIONS/IT": "SERVICES",
  "TELECOMMUNICATIONS/IT": "SERVICES",
  "TELECOM": "SERVICES",
  "TÉLÉCOMMUNICATIONS": "SERVICES",
  "TELECOMMUNICATIONS": "SERVICES",

  // === COMMERCE 🛒 ===
  "COMMERCE": "COMMERCE",
  "DISTRIBUTION": "COMMERCE",
  "IMPORT-EXPORT": "COMMERCE",
  "IMPORT EXPORT": "COMMERCE",

  // === CONSTRUCTION 🏗️ ===
  "CONSTRUCTION": "CONSTRUCTION",
  "BÂTIMENT": "CONSTRUCTION",
  "BATIMENT": "CONSTRUCTION",
  "TRAVAUX PUBLICS": "CONSTRUCTION",
  "BTP": "CONSTRUCTION",
  "BTP / MATÉRIAUX": "CONSTRUCTION",
  "BTP/MATÉRIAUX": "CONSTRUCTION",
  "BTP / MATERIAUX": "CONSTRUCTION",
  "BTP/MATERIAUX": "CONSTRUCTION",
  "MATÉRIAUX": "CONSTRUCTION",
  "MATERIAUX": "CONSTRUCTION",

  // === TECHNOLOGIE 💻 ===
  "TECHNOLOGIE": "TECHNOLOGIE",
  "TECH": "TECHNOLOGIE",
  "NUMÉRIQUE": "TECHNOLOGIE",
  "NUMERIQUE": "TECHNOLOGIE",
  "DIGITAL": "TECHNOLOGIE",
  "IT": "TECHNOLOGIE",

  // === TRANSPORT 🚚 ===
  "TRANSPORT": "TRANSPORT",
  "LOGISTIQUE": "TRANSPORT",
  "TRANSPORT / LOGISTIQUE": "TRANSPORT",
  "TRANSPORT/LOGISTIQUE": "TRANSPORT",
  "TRANSPORT-LOGISTIQUE": "TRANSPORT",

  // === TOURISME ✈️ ===
  "TOURISME": "TOURISME",
  "HÔTELLERIE": "TOURISME",
  "HOTELLERIE": "TOURISME",
  "RESTAURATION": "TOURISME",
  "TOURISME / HÔTELLERIE": "TOURISME",
  "TOURISME/HÔTELLERIE": "TOURISME",
  "TOURISME / HOTELLERIE": "TOURISME",
  "TOURISME/HOTELLERIE": "TOURISME",

  // === SANTÉ 🏥 ===
  "SANTÉ": "SANTE",
  "SANTE": "SANTE",
  "PHARMACIE": "SANTE",
  "MÉDICAL": "SANTE",
  "MEDICAL": "SANTE",

  // === ÉDUCATION 🎓 ===
  "ÉDUCATION": "EDUCATION",
  "EDUCATION": "EDUCATION",
  "FORMATION": "EDUCATION",
  "ENSEIGNEMENT": "EDUCATION",

  // === FINANCE 🏦 ===
  "FINANCE": "FINANCE",
  "BANQUE": "FINANCE",
  "ASSURANCE": "FINANCE",
  "MICROFINANCE": "FINANCE",

  // === AUTRE 📦 ===
  "AUTRE": "AUTRE",
  "SÉCURITÉ / DÉFENSE": "AUTRE",
  "SECURITE / DEFENSE": "AUTRE",
  "SÉCURITÉ/DÉFENSE": "AUTRE",
  "SECURITE/DEFENSE": "AUTRE",
  "ENVIRONNEMENT / DÉCHETS": "AUTRE",
  "ENVIRONNEMENT/DECHETS": "AUTRE",
  "ENVIRONNEMENT": "AUTRE",
  "DÉCHETS": "AUTRE",
  "DECHETS": "AUTRE",
};

const SECTEURS = [
  { value: "AGRICULTURE", label: "Agriculture", emoji: "🌾", color: "#16a34a", bg: "#dcfce7" },
  { value: "INDUSTRIE", label: "Industrie", emoji: "🏭", color: "#2563eb", bg: "#dbeafe" },
  { value: "SERVICES", label: "Services", emoji: "💼", color: "#9333ea", bg: "#f3e8ff" },
  { value: "COMMERCE", label: "Commerce", emoji: "🛒", color: "#d97706", bg: "#fef3c7" },
  { value: "CONSTRUCTION", label: "Construction", emoji: "🏗️", color: "#ea580c", bg: "#ffedd5" },
  { value: "TECHNOLOGIE", label: "Technologie", emoji: "💻", color: "#0891b2", bg: "#cffafe" },
  { value: "TRANSPORT", label: "Transport", emoji: "🚚", color: "#e11d48", bg: "#ffe4e6" },
  { value: "TOURISME", label: "Tourisme", emoji: "✈️", color: "#db2777", bg: "#fce7f3" },
  { value: "SANTE", label: "Santé", emoji: "🏥", color: "#dc2626", bg: "#fee2e2" },
  { value: "EDUCATION", label: "Éducation", emoji: "🎓", color: "#4f46e5", bg: "#e0e7ff" },
  { value: "FINANCE", label: "Finance", emoji: "🏦", color: "#059669", bg: "#d1fae5" },
  { value: "AUTRE", label: "Autre", emoji: "📦", color: "#6b7280", bg: "#f3f4f6" },
];

const REGIONS = [
  "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral",
  "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"
];

// ✅ Fonction de normalisation du secteur (insensible à la casse, aux espaces, aux slashes)
function normalizeSecteur(secteur: string | null): string {
  if (!secteur) return "AUTRE";

  // Normaliser : majuscules, trim, remplacer les espaces multiples par un seul
  const normalized = secteur.toUpperCase().trim().replace(/\s+/g, " ");

  // Chercher dans le mapping
  const mapped = SECTEUR_MAPPING[normalized];
  if (mapped) return mapped;

  // Si pas trouvé exactement, essayer sans accents
  const sansAccents = normalized
    .replace(/[ÉÈÊË]/g, "E")
    .replace(/[ÀÂÄ]/g, "A")
    .replace(/[ÔÖ]/g, "O")
    .replace(/[ÙÛÜ]/g, "U")
    .replace(/[ÎÏ]/g, "I")
    .replace(/[Ç]/g, "C");

  const mappedSansAccents = SECTEUR_MAPPING[sansAccents];
  if (mappedSansAccents) return mappedSansAccents;

  // Dernière tentative : chercher si le secteur contient un mot-clé connu
  if (sansAccents.includes("AGRICULTURE") || sansAccents.includes("AGRO")) return "AGRICULTURE";
  if (sansAccents.includes("BTP") || sansAccents.includes("BATIMENT") || sansAccents.includes("MATERIAUX")) return "CONSTRUCTION";
  if (sansAccents.includes("FINANCE") || sansAccents.includes("BANQUE")) return "FINANCE";
  if (sansAccents.includes("TRANSPORT") || sansAccents.includes("LOGISTIQUE")) return "TRANSPORT";
  if (sansAccents.includes("TELECOMM") || sansAccents.includes("TELECOM") || sansAccents.includes("IT")) return "SERVICES";
  if (sansAccents.includes("TOURISME") || sansAccents.includes("HOTEL")) return "TOURISME";
  if (sansAccents.includes("SANTE") || sansAccents.includes("MEDICAL") || sansAccents.includes("PHARMA")) return "SANTE";
  if (sansAccents.includes("EDUCATION") || sansAccents.includes("FORMATION")) return "EDUCATION";
  if (sansAccents.includes("ENERGIE") || sansAccents.includes("MINES") || sansAccents.includes("METALL") || sansAccents.includes("CHIMIE") || sansAccents.includes("TEXTILE") || sansAccents.includes("PLASTIQUE") || sansAccents.includes("BOIS") || sansAccents.includes("FORÊT") || sansAccents.includes("FORET") || sansAccents.includes("CIMENT") || sansAccents.includes("INDUSTRIE")) return "INDUSTRIE";
  if (sansAccents.includes("COMMERCE") || sansAccents.includes("DISTRIBUTION") || sansAccents.includes("IMPORT")) return "COMMERCE";
  if (sansAccents.includes("TECHNO") || sansAccents.includes("NUMERIQUE") || sansAccents.includes("DIGITAL")) return "TECHNOLOGIE";

  return "AUTRE";
}

export default function EntreprisesPage() {
  const [showForm, setShowForm] = useState(false);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSecteur, setFilterSecteur] = useState("");
  const [filterRegion, setFilterRegion] = useState("");

  const [formData, setFormData] = useState({
    denomination: "", sigle: "", description: "", secteurActivite: "AUTRE",
    ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/entreprises");
      if (res.ok) {
        const data = await res.json();
        const list = data.entreprises || data;
        setEnterprises(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.denomination.trim()) {
      alert("La dénomination est obligatoire");
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
        alert("Entreprise ajoutée !");
        setShowForm(false);
        setFormData({
          denomination: "", sigle: "", description: "", secteurActivite: "AUTRE",
          ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
        });
        fetchData();
      } else {
        alert("Erreur lors de l'ajout");
      }
    } catch (error) {
      alert("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entreprise ?")) return;
    try {
      const res = await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Entreprise supprimée");
        fetchData();
      } else {
        alert("Erreur");
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const getSecteurInfo = (secteur: string) => {
    return SECTEURS.find((s) => s.value === secteur) || SECTEURS[SECTEURS.length - 1];
  };

  // ✅ CORRECTION : Compteurs avec normalisation complète
  const getSecteurCount = (secteurCategorie: string) => {
    if (!Array.isArray(enterprises)) return 0;
    return enterprises.filter((e) => normalizeSecteur(e.secteurActivite) === secteurCategorie).length;
  };

  // ✅ CORRECTION : Filtrage avec normalisation
  const filteredEnterprises = Array.isArray(enterprises) 
    ? enterprises.filter((e) => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = e.denomination.toLowerCase().includes(searchLower) ||
          (e.sigle && e.sigle.toLowerCase().includes(searchLower)) ||
          (e.description && e.description.toLowerCase().includes(searchLower)) ||
          (e.ville && e.ville.toLowerCase().includes(searchLower));
        const matchSecteur = !filterSecteur || normalizeSecteur(e.secteurActivite) === filterSecteur;
        const matchRegion = !filterRegion || e.region === filterRegion;
        return matchSearch && matchSecteur && matchRegion;
      })
    : [];

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
          ← Retour à l'annuaire
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{ padding: "10px", background: "#dbeafe", borderRadius: "8px", fontSize: "24px" }}>🏢</div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>Ajouter une entreprise</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Nouvelle fiche entreprise</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Identité */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "600", color: "#374151" }}>
              🏢 Identité de l'entreprise
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Dénomination <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nom de l'entreprise"
                  required
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
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Description</label>
              <input
                type="text"
                placeholder="Description de l'activité..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {SECTEURS.map((s) => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
              </select>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

          {/* Localisation */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "600", color: "#374151" }}>
              📍 Localisation
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
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
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Adresse postale / BP</label>
              <input
                type="text"
                placeholder="Ex: BP 1234 Yaoundé..."
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

          {/* Contact */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "600", color: "#374151" }}>
              👤 Contact de l'entreprise
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  👤 Nom du contact
                </label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont..."
                  value={formData.nomContact}
                  onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  📞 Téléphone
                </label>
                <input
                  type="text"
                  placeholder="Ex: +237 6XX XXX XXX"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                ✉️ Email
              </label>
              <input
                type="email"
                placeholder="Ex: contact@entreprise.cm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>
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
              disabled={submitting}
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
                opacity: submitting ? 0.5 : 1
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
          <div style={{ padding: "10px", background: "#dbeafe", borderRadius: "8px", fontSize: "24px" }}>🏢</div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>Annuaire des Entreprises</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>{enterprises.length} entreprises répertoriées</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              const csv = [
                ["Dénomination", "Sigle", "Secteur", "Ville", "Région", "Téléphone", "Email", "Contact"].join(","),
                ...filteredEnterprises.map((e) => [
                  e.denomination, e.sigle || "", e.secteurActivite, e.ville || "", e.region || "",
                  e.telephone || "", e.email || "", e.nomContact || ""
                ].join(","))
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `entreprises_${new Date().toISOString().split("T")[0]}.csv`; a.click();
            }}
            style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            📥 Exporter CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ➕ Ajouter
          </button>
        </div>
      </div>

      {/* Compteurs par secteur */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {SECTEURS.map((secteur) => {
          const count = getSecteurCount(secteur.value);
          return (
            <div
              key={secteur.value}
              onClick={() => setFilterSecteur(filterSecteur === secteur.value ? "" : secteur.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s",
                background: filterSecteur === secteur.value ? "#eff6ff" : "white",
                boxShadow: filterSecteur === secteur.value ? "0 0 0 2px #3b82f6" : "none"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ padding: "8px", borderRadius: "6px", background: secteur.bg, marginBottom: "8px", fontSize: "20px" }}>
                  {secteur.emoji}
                </div>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>{count}</p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>{secteur.label}</p>
              </div>
            </div>
          );
        })}
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
              placeholder="Nom, sigle, description..."
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
            {SECTEURS.map((s) => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
          </select>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
          >
            <option value="">Toutes les régions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", background: "white" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            📊 Résultats
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>{filteredEnterprises.length} résultat{filteredEnterprises.length > 1 ? "s" : ""}</p>
        </div>
        <div style={{ padding: "16px" }}>
          {filteredEnterprises.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏢</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Aucune entreprise trouvée</h3>
              <p style={{ color: "#6b7280", margin: 0 }}>Ajustez vos filtres ou ajoutez une nouvelle entreprise.</p>
              <button
                onClick={() => setShowForm(true)}
                style={{ marginTop: "16px", padding: "10px 20px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                ➕ Ajouter une entreprise
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredEnterprises.map((enterprise) => {
                const secteurNormalise = normalizeSecteur(enterprise.secteurActivite);
                const secteurInfo = getSecteurInfo(secteurNormalise);
                return (
                  <div
                    key={enterprise.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ padding: "8px", borderRadius: "6px", background: secteurInfo.bg, fontSize: "20px" }}>
                        {secteurInfo.emoji}
                      </div>
                      <div>
                        <p style={{ fontWeight: "600", margin: 0, color: "#111827" }}>{enterprise.denomination}</p>
                        {enterprise.sigle && <p style={{ fontSize: "14px", color: "#6b7280", margin: "2px 0 0 0" }}>{enterprise.sigle}</p>}
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <span style={{ padding: "2px 8px", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "12px" }}>
                            {enterprise.secteurActivite || secteurInfo.label}
                          </span>
                          {enterprise.ville && (
                            <span style={{ padding: "2px 8px", background: "#f3f4f6", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                              📍 {enterprise.ville}{enterprise.region && `, ${enterprise.region}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleDelete(enterprise.id)}
                        style={{ padding: "6px", border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontSize: "16px" }}
                      >
                        🗑️
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
