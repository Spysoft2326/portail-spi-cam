"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { REGIONS, UNITES, normaliser, valeurReferentiel } from "@/lib/referentiels";

interface Filiere { code: string; libelle: string; prioritaire: boolean }
interface ActiviteRef { code: string; libelle: string; section: string; filiereCode: string | null; industrielle: boolean }
interface Etablissement {
  id: string; nom: string | null; principal: boolean; region: string | null; ville: string | null;
  quartier: string | null; lieuDit: string | null; classeEtablissement: string | null; activiteCode: string | null;
}

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
  motifRejet: string | null;
  agentId: string | null;
  numContribuable: string | null;
  taille: string | null;
  activiteCode: string | null;
  filiereCode: string | null;
  filiereManuelle: boolean;
  champIndustriel: boolean;
  activite: { code: string; libelle: string; section: string } | null;
  filiere: { code: string; libelle: string; prioritaire: boolean } | null;
  _count?: { productions: number; produits: number; etablissements: number };
}

interface Produit {
  id?: string;
  nom: string;
  unite: string;
  actif?: boolean;
  _count?: { lignes: number };
}

const STATUT_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  ACTIF: { label: "✅ Actif", bg: "#d1fae5", color: "#059669" },
  EN_ATTENTE: { label: "⏳ En attente", bg: "#fef3c7", color: "#d97706" },
  REJETE: { label: "❌ Rejeté", bg: "#fee2e2", color: "#dc2626" },
  INACTIF: { label: "⏸ Inactif", bg: "#f3f4f6", color: "#6b7280" },
};

const input = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" } as const;
const label = { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 } as const;
const btn = { padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px" } as const;
const btnPrimary = { ...btn, border: "none", background: "#059669", color: "white" } as const;

const FORM_VIDE = {
  denomination: "", sigle: "", activiteCode: "", filiereCode: "", taille: "", numContribuable: "",
  ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
};
const ETAB_VIDE = { nom: "", region: "", ville: "", quartier: "", lieuDit: "", classeEtablissement: "" };
const libelleActivite = (a: { code: string; libelle: string }) => `${a.code} — ${a.libelle}`;

export default function EntreprisesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as string) || "";
  const userId = (session?.user?.id as string) || "";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAgent = userRole === "AGENT_SAISIE";

  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFiliere, setFilterFiliere] = useState("");
  const [filterChamp, setFilterChamp] = useState("");
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [activites, setActivites] = useState<ActiviteRef[]>([]);
  const [saisieActivite, setSaisieActivite] = useState(""); // texte du champ de recherche d'activité
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [nouvelEtab, setNouvelEtab] = useState(ETAB_VIDE);
  const [filterRegion, setFilterRegion] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Enterprise | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [produits, setProduits] = useState<Produit[]>([]); // catalogue (création : liste locale ; édition : depuis l'API)
  const [nouveauProduit, setNouveauProduit] = useState<Produit>({ nom: "", unite: "t" });

  const [rejet, setRejet] = useState<{ id: string; nom: string } | null>(null);
  const [motif, setMotif] = useState("");

  useEffect(() => {
    if (session) fetchAllData();
  }, [session]);

  // Référentiels : filières et classes d'activité (CITI Rév.4)
  useEffect(() => {
    fetch("/api/referentiels")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setFilieres(d.filieres); setActivites(d.activites); } })
      .catch(() => {});
  }, []);

  const activiteChoisie = activites.find((a) => a.code === formData.activiteCode);
  const filiereDeduite = filieres.find((f) => f.code === activiteChoisie?.filiereCode);

  const choisirActivite = (texte: string) => {
    setSaisieActivite(texte);
    const code = texte.trim().slice(0, 4);
    const a = activites.find((x) => x.code === code && texte.startsWith(code));
    setFormData((f) => ({ ...f, activiteCode: a ? a.code : "" }));
  };

  const fetchEtablissements = async (id: string) => {
    const res = await fetch(`/api/entreprises/${id}/etablissements`);
    setEtablissements(res.ok ? await res.json() : []);
  };

  const ajouterEtablissement = async () => {
    if (!editing) return;
    if (!nouvelEtab.ville.trim() && !nouvelEtab.nom.trim()) return alert("Indiquez au moins un nom ou une ville");
    const res = await fetch(`/api/entreprises/${editing.id}/etablissements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nouvelEtab, activiteCode: formData.activiteCode || null }),
    });
    if (!res.ok) return alert("Erreur : " + ((await res.json().catch(() => ({}))).error || "ajout impossible"));
    setNouvelEtab(ETAB_VIDE);
    fetchEtablissements(editing.id);
  };

  const supprimerEtablissement = async (etab: Etablissement) => {
    if (!editing || !confirm(`Supprimer l'établissement « ${etab.nom || etab.ville} » ?`)) return;
    const res = await fetch(`/api/entreprises/${editing.id}/etablissements?etablissementId=${etab.id}`, { method: "DELETE" });
    if (!res.ok) return alert("Erreur : " + ((await res.json().catch(() => ({}))).error || "suppression impossible"));
    fetchEtablissements(editing.id);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/entreprises");
      const data = res.ok ? await res.json() : [];
      setEnterprises(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur fetch:", error);
      setEnterprises([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async (id: string) => {
    const res = await fetch(`/api/entreprises/${id}/produits?tous=1`);
    setProduits(res.ok ? await res.json() : []);
  };

  const canEdit = (e: Enterprise) => isAdmin || (isAgent && e.agentId === userId && (e.statut === "EN_ATTENTE" || e.statut === "REJETE"));

  const resetForm = () => {
    setFormData(FORM_VIDE);
    setSaisieActivite("");
    setEtablissements([]);
    setNouvelEtab(ETAB_VIDE);
    setProduits([]);
    setNouveauProduit({ nom: "", unite: "t" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (e: Enterprise) => {
    setFormData({
      denomination: e.denomination,
      sigle: e.sigle || "",
      activiteCode: e.activiteCode || "",
      filiereCode: e.filiereManuelle ? e.filiereCode || "" : "",
      taille: e.taille || "",
      numContribuable: e.numContribuable || "",
      ville: e.ville || "",
      region: valeurReferentiel(REGIONS, e.region),
      adresse: e.adresse || "",
      telephone: e.telephone || "",
      email: e.email || "",
      nomContact: e.nomContact || "",
    });
    setSaisieActivite(e.activite ? libelleActivite(e.activite) : "");
    setEditing(e);
    setProduits([]);
    fetchProduits(e.id);
    fetchEtablissements(e.id);
    setShowForm(true);
  };

  const ajouterProduit = async () => {
    const nom = nouveauProduit.nom.trim();
    if (!nom) return;
    if (produits.some((p) => normaliser(p.nom) === normaliser(nom))) {
      alert("Ce produit est déjà dans la liste");
      return;
    }
    if (!editing) {
      setProduits([...produits, { nom, unite: nouveauProduit.unite }]);
    } else {
      const res = await fetch(`/api/entreprises/${editing.id}/produits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, unite: nouveauProduit.unite }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "ajout impossible"));
        return;
      }
      fetchProduits(editing.id);
    }
    setNouveauProduit({ nom: "", unite: nouveauProduit.unite });
  };

  const basculerProduit = async (p: Produit) => {
    if (!editing || !p.id) return;
    const res = await fetch(`/api/entreprises/${editing.id}/produits`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produitId: p.id, actif: !p.actif }),
    });
    if (res.ok) fetchProduits(editing.id);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.denomination.trim()) {
      alert("La dénomination est obligatoire");
      return;
    }
    if (!formData.region) {
      alert("La région est obligatoire");
      return;
    }
    if (!formData.activiteCode) {
      alert("Choisissez l'activité principale dans la liste de la nomenclature (code à 4 chiffres)");
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/entreprises/${editing.id}` : "/api/entreprises";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        // Filière vide = déduite automatiquement de l'activité (seuls les admins peuvent la forcer)
        body: JSON.stringify({ ...formData, filiereCode: isAdmin ? formData.filiereCode || null : undefined, ...(editing ? {} : { produits }) }),
      });
      if (res.ok) {
        alert(
          editing
            ? isAgent ? "Fiche corrigée : elle repart en validation." : "Entreprise modifiée !"
            : isAgent ? "Fiche enregistrée : elle sera visible après validation par un administrateur." : "Entreprise ajoutée !"
        );
        resetForm();
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Erreur lors de l'opération"));
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entreprise et toutes ses déclarations ? Cette action est irréversible.")) return;
    const res = await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
    if (res.ok) fetchAllData();
    else alert("Erreur : " + ((await res.json().catch(() => ({}))).error || "suppression impossible"));
  };

  const changerStatut = async (id: string, statut: string, motifRejet?: string) => {
    const res = await fetch(`/api/entreprises/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut, motifRejet }),
    });
    if (res.ok) {
      setRejet(null);
      setMotif("");
      fetchAllData();
    } else {
      alert("Erreur : " + ((await res.json().catch(() => ({}))).error || "opération impossible"));
    }
  };

  const villesUniques = Array.from(new Set(
    enterprises
      .filter((e) => !filterRegion || normaliser(e.region) === normaliser(filterRegion))
      .map((e) => e.ville)
      .filter((v): v is string => !!v && v.trim() !== "")
  )).sort((a, b) => a.localeCompare(b, "fr"));

  const q = normaliser(searchTerm);
  const filteredEnterprises = enterprises.filter((e) => {
    const matchSearch = !q || [e.denomination, e.sigle, e.ville, e.region, e.adresse, e.nomContact, e.telephone, e.email, e.referenceSPI, e.numContribuable, e.activite?.libelle, e.activiteCode]
      .some((v) => normaliser(v).includes(q));
    const matchFiliere = !filterFiliere || (filterFiliere === "AUCUNE" ? !e.filiereCode : e.filiereCode === filterFiliere);
    const matchChamp = !filterChamp || (filterChamp === "industriel" ? e.champIndustriel : filterChamp === "hors" ? !e.champIndustriel : !e.activiteCode);
    const matchRegion = !filterRegion || normaliser(e.region) === normaliser(filterRegion);
    const matchVille = !filterVille || e.ville === filterVille;
    const matchStatut = !filterStatut || (filterStatut === "MES_SAISIES" ? e.agentId === userId : e.statut === filterStatut);
    return matchSearch && matchFiliere && matchChamp && matchRegion && matchVille && matchStatut;
  });
  const nonCodees = enterprises.filter((e) => !e.activiteCode).length;

  const enAttente = enterprises.filter((e) => e.statut === "EN_ATTENTE").length;
  const mesRejets = isAgent ? enterprises.filter((e) => e.agentId === userId && e.statut === "REJETE").length : 0;

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Chargement des entreprises...</p>
      </div>
    );
  }

  // ------------------------------------------------------------------ FORMULAIRE
  if (showForm) {
    const peutGererCatalogue = !editing || isAdmin || canEdit(editing);
    return (
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <button onClick={resetForm} style={{ marginBottom: "24px", background: "none", border: "none", cursor: "pointer", color: "#374151", fontSize: "14px" }}>
          ← Retour à l&apos;annuaire
        </button>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 4px 0", color: "#111827" }}>
          {editing ? "Modifier l'entreprise" : "Ajouter une entreprise"}
        </h1>
        <p style={{ margin: "0 0 24px 0", color: "#6b7280", fontSize: "14px" }}>
          {isAgent ? "Votre saisie sera vérifiée par un administrateur avant publication." : "La fiche est publiée directement."}
        </p>

        {editing?.statut === "REJETE" && editing.motifRejet && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b", marginBottom: "20px", fontSize: "14px" }}>
            <strong>Motif du rejet :</strong> {editing.motifRejet}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "16px" }}>🏢 Identité</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div>
              <label style={label}>Dénomination <span style={{ color: "#ef4444" }}>*</span></label>
              <input required value={formData.denomination} onChange={(e) => setFormData({ ...formData, denomination: e.target.value })} style={input} />
            </div>
            <div>
              <label style={label}>Sigle</label>
              <input value={formData.sigle} onChange={(e) => setFormData({ ...formData, sigle: e.target.value })} style={input} />
            </div>
            <div>
              <label style={label}>NIU (numéro d&apos;identifiant unique)</label>
              <input value={formData.numContribuable} onChange={(e) => setFormData({ ...formData, numContribuable: e.target.value })} style={input} placeholder="Ex : M0123456789012A" />
            </div>
            <div>
              <label style={label}>Taille</label>
              <select value={formData.taille} onChange={(e) => setFormData({ ...formData, taille: e.target.value })} style={input}>
                <option value="">Non renseignée</option>
                <option value="GE">Grande entreprise</option>
                <option value="PME">PME</option>
                <option value="TPE">Très petite entreprise</option>
              </select>
            </div>
          </div>

          {/* ----------------------------- Activité codée (nomenclature) */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: "28px 0 4px" }}>🏭 Activité principale</h3>
          <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: "13px" }}>
            Classe de la nomenclature d&apos;activités (CITI Rév.4, base de la NACAM). Tapez un mot-clé (« ciment », « bière ») ou un code.
          </p>
          {editing && !editing.activiteCode && editing.secteurActivite && (
            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#92400e", background: "#fef3c7", padding: "8px 12px", borderRadius: "6px" }}>
              Ancien secteur saisi en texte libre : « {editing.secteurActivite} ». Choisissez l&apos;activité codée correspondante.
            </p>
          )}
          <input list="liste-activites" required value={saisieActivite} onChange={(e) => choisirActivite(e.target.value)}
            placeholder="Ex : 2394 — Fabrication de ciment, chaux et plâtre" style={{ ...input, borderColor: saisieActivite && !formData.activiteCode ? "#ef4444" : "#d1d5db" }} />
          <datalist id="liste-activites">
            {activites.map((a) => <option key={a.code} value={libelleActivite(a)} />)}
          </datalist>
          {saisieActivite && !formData.activiteCode && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#dc2626" }}>Choisissez une ligne proposée dans la liste.</p>}
          {activiteChoisie && (
            <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", fontSize: "13px" }}>
              <span style={{ padding: "4px 10px", borderRadius: "12px", background: filiereDeduite ? "#dbeafe" : "#f3f4f6", color: filiereDeduite ? "#1e40af" : "#6b7280" }}>
                Filière : {filiereDeduite ? filiereDeduite.libelle : "hors filière industrielle"}{filiereDeduite?.prioritaire ? " ★ SND30" : ""}
              </span>
              <span style={{ padding: "4px 10px", borderRadius: "12px", background: activiteChoisie.industrielle ? "#d1fae5" : "#fee2e2", color: activiteChoisie.industrielle ? "#065f46" : "#991b1b" }}>
                {activiteChoisie.industrielle ? "Champ industriel" : `Hors champ industriel (section ${activiteChoisie.section})`}
              </span>
            </div>
          )}
          {isAdmin && (
            <div style={{ marginTop: "12px", maxWidth: "420px" }}>
              <label style={label}>Filière (forcer une autre filière — administrateurs)</label>
              <select value={formData.filiereCode} onChange={(e) => setFormData({ ...formData, filiereCode: e.target.value })} style={input}>
                <option value="">Déduite automatiquement de l&apos;activité</option>
                {filieres.map((f) => <option key={f.code} value={f.code}>{f.libelle}</option>)}
              </select>
            </div>
          )}

          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: "28px 0 16px" }}>📍 Localisation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div>
              <label style={label}>Région <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} style={input}>
                <option value="">Choisir...</option>
                {formData.region && !REGIONS.includes(formData.region) && <option value={formData.region}>{formData.region}</option>}
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Ville</label>
              <input value={formData.ville} onChange={(e) => setFormData({ ...formData, ville: e.target.value })} style={input} placeholder="Ex : Douala" />
            </div>
            <div>
              <label style={label}>Adresse / BP</label>
              <input value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} style={input} />
            </div>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: "28px 0 16px" }}>👤 Contact</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div>
              <label style={label}>Nom du contact</label>
              <input value={formData.nomContact} onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })} style={input} />
            </div>
            <div>
              <label style={label}>Téléphone</label>
              <input value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} style={input} placeholder="+237 6XX XXX XXX" />
            </div>
            <div>
              <label style={label}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={input} />
            </div>
          </div>

          {/* ----------------------------- Catalogue des produits */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: "28px 0 4px" }}>📦 Produits fabriqués</h3>
          <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: "13px" }}>
            Ces produits seront proposés lors des déclarations trimestrielles. {editing ? "Les ajouts sont enregistrés immédiatement." : ""}
          </p>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            {produits.length === 0 && <p style={{ padding: "12px 16px", margin: 0, color: "#9ca3af", fontSize: "14px" }}>Aucun produit pour l&apos;instant.</p>}
            {produits.map((p, i) => (
              <div key={p.id || i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderBottom: "1px solid #f3f4f6", opacity: p.actif === false ? 0.5 : 1 }}>
                <span style={{ flex: 1, fontSize: "14px" }}>{p.nom}</span>
                <span style={{ fontSize: "12px", padding: "2px 8px", background: "#f3f4f6", borderRadius: "4px" }}>{p.unite}</span>
                {p._count && <span style={{ fontSize: "12px", color: "#9ca3af" }}>{p._count.lignes} déclaration(s)</span>}
                {!editing && (
                  <button type="button" onClick={() => setProduits(produits.filter((_, j) => j !== i))} style={{ ...btn, padding: "4px 8px", color: "#dc2626" }}>Retirer</button>
                )}
                {editing && isAdmin && p.id && (
                  <button type="button" onClick={() => basculerProduit(p)} style={{ ...btn, padding: "4px 8px", fontSize: "12px" }}>
                    {p.actif ? "Désactiver" : "Réactiver"}
                  </button>
                )}
              </div>
            ))}
            {peutGererCatalogue && (
              <div style={{ display: "flex", gap: "8px", padding: "12px 16px", background: "#f9fafb" }}>
                <input placeholder="Nom du produit (ex : Ciment CPJ 42.5)" value={nouveauProduit.nom}
                  onChange={(e) => setNouveauProduit({ ...nouveauProduit, nom: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ajouterProduit(); } }}
                  style={{ ...input, flex: 1 }} />
                <select value={nouveauProduit.unite} onChange={(e) => setNouveauProduit({ ...nouveauProduit, unite: e.target.value })} style={{ ...input, width: "110px" }}>
                  {UNITES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <button type="button" onClick={ajouterProduit} style={btnPrimary}>Ajouter</button>
              </div>
            )}
          </div>

          {/* ----------------------------- Établissements (sites, usines) */}
          {editing && (
            <>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: "28px 0 4px" }}>🏗️ Établissements (sites, usines)</h3>
              <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: "13px" }}>
                Une entreprise peut exploiter plusieurs sites. Classe 1 ou 2 : établissement classé (loi n° 98/015 du 14 juillet 1998).
              </p>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                {etablissements.map((et) => (
                  <div key={et.id} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #f3f4f6", fontSize: "14px", flexWrap: "wrap" }}>
                    <span style={{ flex: 1, minWidth: "200px" }}>
                      <strong>{et.nom || "Site"}</strong>{et.principal && <span style={{ marginLeft: "6px", fontSize: "11px", padding: "2px 6px", background: "#d1fae5", color: "#065f46", borderRadius: "4px" }}>principal</span>}
                      <span style={{ display: "block", fontSize: "12px", color: "#6b7280" }}>{[et.quartier, et.lieuDit, et.ville, et.region].filter(Boolean).join(" · ") || "Adresse non renseignée"}</span>
                    </span>
                    {et.classeEtablissement && <span style={{ fontSize: "12px", padding: "2px 8px", background: "#fef3c7", color: "#92400e", borderRadius: "4px" }}>Classé {et.classeEtablissement}<sup>{et.classeEtablissement === "1" ? "re" : "e"}</sup> classe</span>}
                    {isAdmin && !et.principal && <button type="button" onClick={() => supprimerEtablissement(et)} style={{ ...btn, padding: "4px 8px", color: "#dc2626", fontSize: "12px" }}>Supprimer</button>}
                  </div>
                ))}
                {canEdit(editing) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", padding: "12px 16px", background: "#f9fafb" }}>
                    <input placeholder="Nom du site (ex : Usine de Bonabéri)" value={nouvelEtab.nom} onChange={(e) => setNouvelEtab({ ...nouvelEtab, nom: e.target.value })} style={input} />
                    <input placeholder="Ville" value={nouvelEtab.ville} onChange={(e) => setNouvelEtab({ ...nouvelEtab, ville: e.target.value })} style={input} />
                    <select value={nouvelEtab.region} onChange={(e) => setNouvelEtab({ ...nouvelEtab, region: e.target.value })} style={input}>
                      <option value="">Région...</option>
                      {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input placeholder="Quartier" value={nouvelEtab.quartier} onChange={(e) => setNouvelEtab({ ...nouvelEtab, quartier: e.target.value })} style={input} />
                    <input placeholder="Lieu-dit" value={nouvelEtab.lieuDit} onChange={(e) => setNouvelEtab({ ...nouvelEtab, lieuDit: e.target.value })} style={input} />
                    <select value={nouvelEtab.classeEtablissement} onChange={(e) => setNouvelEtab({ ...nouvelEtab, classeEtablissement: e.target.value })} style={input}>
                      <option value="">Non classé</option>
                      <option value="1">Établissement classé 1re classe</option>
                      <option value="2">Établissement classé 2e classe</option>
                    </select>
                    <button type="button" onClick={ajouterEtablissement} style={btnPrimary}>Ajouter le site</button>
                  </div>
                )}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: "12px", paddingTop: "24px" }}>
            <button type="button" onClick={resetForm} style={btn}>Annuler</button>
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.5 : 1 }}>
              💾 {submitting ? "Enregistrement..." : editing ? (isAgent ? "Corriger et resoumettre" : "Enregistrer") : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ------------------------------------------------------------------ LISTE
  return (
    <div style={{ padding: "24px" }}>
      {rejet && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "100%", maxWidth: "480px" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "18px" }}>Rejeter la fiche</h2>
            <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: "14px" }}>{rejet.nom} — l&apos;agent verra ce motif pour corriger sa saisie.</p>
            <textarea autoFocus rows={4} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif du rejet (obligatoire)" style={{ ...input, resize: "vertical" }} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => { setRejet(null); setMotif(""); }} style={btn}>Annuler</button>
              <button disabled={!motif.trim()} onClick={() => changerStatut(rejet.id, "REJETE", motif)} style={{ ...btnPrimary, background: "#dc2626", opacity: motif.trim() ? 1 : 0.5 }}>Rejeter</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>🏢 Annuaire des entreprises</h1>
          <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
            {enterprises.length} entreprises · {filteredEnterprises.length} résultat{filteredEnterprises.length > 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              const headers = ["Reference SPI", "Denomination", "Sigle", "NIU", "Code CITI", "Activite", "Filiere", "Champ industriel", "Taille", "Ville", "Region", "Telephone", "Email", "Contact", "Produits", "Etablissements", "Statut"];
              const rows = filteredEnterprises.map((e) => [e.referenceSPI, e.denomination, e.sigle || "", e.numContribuable || "", e.activiteCode || "", e.activite?.libelle || "",
                e.filiere?.libelle || "", e.champIndustriel ? "oui" : "non", e.taille || "", e.ville || "", e.region || "",
                e.telephone || "", e.email || "", e.nomContact || "", String(e._count?.produits ?? 0), String(e._count?.etablissements ?? 0), e.statut]);
              const csv = "﻿" + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
              const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
              const a = document.createElement("a"); a.href = url; a.download = `entreprises_${new Date().toISOString().split("T")[0]}.csv`; a.click();
            }}
            style={btn}
          >📥 Exporter CSV</button>
          {(isAdmin || isAgent) && <button onClick={() => setShowForm(true)} style={btnPrimary}>➕ Ajouter</button>}
        </div>
      </div>

      {isAdmin && enAttente > 0 && filterStatut !== "EN_ATTENTE" && (
        <button onClick={() => setFilterStatut("EN_ATTENTE")} style={{ width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fbbf24", background: "#fef3c7", color: "#92400e", marginBottom: "16px", cursor: "pointer", fontSize: "14px" }}>
          ⏳ <strong>{enAttente}</strong> fiche(s) en attente de validation — cliquer pour les afficher
        </button>
      )}
      {isAdmin && nonCodees > 0 && filterChamp !== "noncode" && (
        <button onClick={() => setFilterChamp("noncode")} style={{ width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "8px", border: "1px solid #93c5fd", background: "#eff6ff", color: "#1e40af", marginBottom: "16px", cursor: "pointer", fontSize: "14px" }}>
          🏷️ <strong>{nonCodees}</strong> fiche(s) sans activité codée (ancien secteur en texte libre) — cliquer pour les afficher et les classer
        </button>
      )}
      {isAgent && mesRejets > 0 && filterStatut !== "MES_SAISIES" && (
        <button onClick={() => setFilterStatut("MES_SAISIES")} style={{ width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fee2e2", color: "#991b1b", marginBottom: "16px", cursor: "pointer", fontSize: "14px" }}>
          ❌ <strong>{mesRejets}</strong> de vos fiches ont été rejetées et attendent une correction — cliquer pour les afficher
        </button>
      )}

      <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <input placeholder="🔍 Nom, sigle, ville, contact, référence..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={input} />
          <select value={filterFiliere} onChange={(e) => setFilterFiliere(e.target.value)} style={input}>
            <option value="">Toutes les filières</option>
            {filieres.map((f) => <option key={f.code} value={f.code}>{f.libelle}{f.prioritaire ? " ★" : ""}</option>)}
            <option value="AUCUNE">Hors filière</option>
          </select>
          <select value={filterChamp} onChange={(e) => setFilterChamp(e.target.value)} style={input}>
            <option value="">Champ : tous</option>
            <option value="industriel">Champ industriel</option>
            <option value="hors">Hors champ industriel</option>
            <option value="noncode">Activité non codée</option>
          </select>
          <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); setFilterVille(""); }} style={input}>
            <option value="">Toutes les régions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterVille} onChange={(e) => setFilterVille(e.target.value)} style={input}>
            <option value="">Toutes les villes</option>
            {villesUniques.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} style={input}>
            <option value="">Tous les statuts</option>
            {isAgent && <option value="MES_SAISIES">Mes saisies</option>}
            <option value="ACTIF">Actives</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="REJETE">Rejetées</option>
            {isAdmin && <option value="INACTIF">Inactives</option>}
          </select>
        </div>
        {(searchTerm || filterFiliere || filterChamp || filterRegion || filterVille || filterStatut) && (
          <button onClick={() => { setSearchTerm(""); setFilterFiliere(""); setFilterChamp(""); setFilterRegion(""); setFilterVille(""); setFilterStatut(""); }} style={{ ...btn, marginTop: "12px", fontSize: "13px", color: "#6b7280" }}>
            🔄 Réinitialiser les filtres
          </button>
        )}
      </div>

      <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", overflowX: "auto" }}>
        {filteredEnterprises.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px 0" }}>Aucune entreprise trouvée</h3>
            <p style={{ color: "#6b7280", margin: 0 }}>Ajustez vos filtres ou ajoutez une nouvelle entreprise.</p>
          </div>
        ) : (
          <div style={{ minWidth: "900px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1.2fr 0.7fr 1fr 150px", padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
              <div>Entreprise</div><div>Filière / activité</div><div>Localisation</div><div>Contact</div><div>Produits</div><div>Statut</div><div style={{ textAlign: "right" }}>Actions</div>
            </div>
            {filteredEnterprises.map((e) => {
              const st = STATUT_LABEL[e.statut] || STATUT_LABEL.INACTIF;
              return (
                <div key={e.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1.2fr 0.7fr 1fr 150px", padding: "14px 16px", borderBottom: "1px solid #f3f4f6", alignItems: "center", fontSize: "13px" }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0, color: "#111827", fontSize: "14px" }}>{e.denomination}</p>
                    {e.sigle && <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>{e.sigle}</p>}
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0 0" }}>Réf : {e.referenceSPI}</p>
                  </div>
                  <div>
                    <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", background: e.filiere ? "#dbeafe" : "#f3f4f6", color: e.filiere ? "#1e40af" : "#6b7280" }}>
                      {e.filiere?.libelle || (e.activiteCode ? "Hors filière" : e.secteurActivite)}
                    </span>
                    {e.activite ? (
                      <p title={e.activite.libelle} style={{ margin: "4px 0 0", fontSize: "11px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.activite.code} · {e.activite.libelle}
                      </p>
                    ) : (
                      <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#d97706" }}>Activité non codée</p>
                    )}
                    {e.activiteCode && !e.champIndustriel && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#991b1b" }}>Hors champ industriel</p>}
                  </div>
                  <div>
                    <p style={{ margin: 0 }}>{e.ville || "-"}</p>
                    {e.region && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#9ca3af" }}>{e.region}</p>}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {e.nomContact && <p style={{ margin: 0, color: "#374151" }}>{e.nomContact}</p>}
                    {e.telephone && <p style={{ margin: "2px 0 0 0" }}>📞 {e.telephone}</p>}
                    {e.email && <p style={{ margin: "2px 0 0 0" }}>✉️ {e.email}</p>}
                    {!e.nomContact && !e.telephone && !e.email && "-"}
                  </div>
                  <div>{e._count?.produits ?? 0}</div>
                  <div>
                    <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 500, background: st.bg, color: st.color }}>{st.label}</span>
                    {e.statut === "REJETE" && e.motifRejet && (
                      <p title={e.motifRejet} style={{ margin: "4px 0 0", fontSize: "11px", color: "#991b1b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Motif : {e.motifRejet}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {canEdit(e) && <button onClick={() => handleEdit(e)} title="Modifier" style={{ ...btn, padding: "6px" }}>✏️</button>}
                    {isAdmin && e.statut === "EN_ATTENTE" && (
                      <>
                        <button onClick={() => changerStatut(e.id, "ACTIF")} title="Valider" style={{ ...btn, padding: "6px", borderColor: "#059669", color: "#059669", background: "#ecfdf5" }}>✓</button>
                        <button onClick={() => setRejet({ id: e.id, nom: e.denomination })} title="Rejeter" style={{ ...btn, padding: "6px", borderColor: "#dc2626", color: "#dc2626", background: "#fef2f2" }}>✕</button>
                      </>
                    )}
                    {isAdmin && e.statut === "ACTIF" && (
                      <button onClick={() => { if (confirm(`Désactiver ${e.denomination} ? Elle n'apparaîtra plus dans l'annuaire public.`)) changerStatut(e.id, "INACTIF"); }} title="Désactiver" style={{ ...btn, padding: "6px" }}>⏸</button>
                    )}
                    {isAdmin && (e.statut === "INACTIF" || e.statut === "REJETE") && (
                      <button onClick={() => changerStatut(e.id, "ACTIF")} title="Réactiver" style={{ ...btn, padding: "6px" }}>▶</button>
                    )}
                    {isSuperAdmin && <button onClick={() => handleDelete(e.id)} title="Supprimer" style={{ ...btn, padding: "6px", borderColor: "#ef4444" }}>🗑️</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
