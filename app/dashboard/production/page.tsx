"use client";

import { useState, useEffect, FormEvent, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Factory, Plus, Download, Upload, Search, Building2, Calendar, Package, DollarSign, Users,
  MessageSquare, Save, ArrowLeft, Pencil, Trash2, CheckCircle2, XCircle, Clock, X, AlertCircle,
  CheckCircle, CheckSquare, Eye, ChevronDown, ChevronUp,
} from "lucide-react";
import { UNITES, normaliser } from "@/lib/referentiels";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";

// ------------------------------------------------------------------ Types
interface Enterprise {
  id: string;
  denomination: string;
  sigle: string | null;
  secteurActivite: string;
  referenceSPI: string;
  statut: string;
}
interface Produit { id: string; nom: string; unite: string }
interface Ligne { id?: string; produitId?: string | null; produit: string; quantite: number; unite: string }
interface Declaration {
  id: string;
  entrepriseId: string;
  entreprise: { id: string; denomination: string; sigle: string | null; secteurActivite: string; referenceSPI: string };
  annee: number | null;
  trimestre: number | null;
  chiffreAffaires: number | null;
  effectifs: number | null;
  commentaire: string | null;
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
  motifRejet: string | null;
  saisiePar: string | null;
  agentSaisie: { name: string | null; email: string | null } | null;
  adminValidation: { name: string | null; email: string | null } | null;
  dateValidation: string | null;
  createdAt: string;
  updatedAt: string;
  lignes: Ligne[];
}
interface LigneForm { produitId: string; produit: string; quantite: string; unite: string; nouveau: boolean }
interface ImportResult { success: number; errors: number; total: number; details: { row: string; ok: boolean; message: string }[] }

// ------------------------------------------------------------------ Helpers
const MILLION = 1_000_000;
const ANNEE_COURANTE = new Date().getFullYear();
const ANNEES = Array.from({ length: 6 }, (_, i) => ANNEE_COURANTE - 4 + i);
const trimestreCourant = () => Math.ceil((new Date().getMonth() + 1) / 3);

function isEstimation(annee: number | null, trimestre: number | null) {
  if (!annee || !trimestre) return false;
  return annee > ANNEE_COURANTE || (annee === ANNEE_COURANTE && trimestre > trimestreCourant());
}
const fmt = (n: number | null | undefined, digits = 0) =>
  (n ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: digits });
const fmtMFCFA = (fcfa: number | null) => fmt((fcfa ?? 0) / MILLION, 1) + " M FCFA";

const STATUT: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
  EN_ATTENTE: { label: "En attente", bg: "#fef3c7", color: "#d97706", Icon: Clock },
  VALIDE: { label: "Validée", bg: "#d1fae5", color: "#059669", Icon: CheckCircle2 },
  REJETE: { label: "Rejetée", bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
};

const input = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" } as const;
const label = { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 } as const;
const btn = { padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" } as const;
const btnPrimary = { ...btn, border: "none", background: "#059669", color: "white" } as const;

const ligneVide = (): LigneForm => ({ produitId: "", produit: "", quantite: "", unite: "t", nouveau: false });

// Découpe une ligne CSV en gérant les guillemets ("a;b" reste un seul champ)
function splitCSVLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted;
    } else if (c === sep && !quoted) { out.push(cur.trim()); cur = ""; }
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ";" : ",";
  const headers = splitCSVLine(lines[0], sep).map((h) => normaliser(h).replace(/[\s-]+/g, "_"));
  return lines.slice(1).map((l) => {
    const v = splitCSVLine(l, sep);
    return Object.fromEntries(headers.map((h, i) => [h, v[i] ?? ""]));
  });
}

// ------------------------------------------------------------------ Page
export default function ProductionPage() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as string) || "";
  const userId = (session?.user?.id as string) || "";
  const isAgent = userRole === "AGENT_SAISIE";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnnee, setFilterAnnee] = useState("");
  const [filterTrimestre, setFilterTrimestre] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [ouverts, setOuverts] = useState<Set<string>>(new Set());

  // formulaire
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Declaration | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ entrepriseId: "", annee: String(ANNEE_COURANTE), trimestre: String(trimestreCourant()), chiffreAffaires: "", effectifs: "", commentaire: "" });
  const [lignes, setLignes] = useState<LigneForm[]>([ligneVide()]);
  const [catalogue, setCatalogue] = useState<Produit[]>([]);

  // validation
  const [rejet, setRejet] = useState<Declaration | null>(null);
  const [motif, setMotif] = useState("");
  const [validateAllLoading, setValidateAllLoading] = useState(false);

  // import
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) fetchAllData();
  }, [session]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setMessage("");
      const [entRes, prodRes] = await Promise.all([fetch("/api/entreprises"), fetch("/api/productions")]);
      if (entRes.ok) setEnterprises(await entRes.json());
      else setMessage("Erreur de chargement des entreprises");
      if (prodRes.ok) setDeclarations(await prodRes.json());
      else setMessage("Erreur de chargement des déclarations");
    } catch {
      setMessage("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // Le catalogue de produits suit l'entreprise choisie
  useEffect(() => {
    if (!form.entrepriseId) { setCatalogue([]); return; }
    fetch(`/api/entreprises/${form.entrepriseId}/produits`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCatalogue)
      .catch(() => setCatalogue([]));
  }, [form.entrepriseId]);

  const entreprisesActives = useMemo(() => enterprises.filter((e) => e.statut === "ACTIF"), [enterprises]);

  // Une déclaration existe-t-elle déjà pour cette entreprise et ce trimestre ?
  const doublon = useMemo(() => {
    if (!form.entrepriseId) return null;
    return declarations.find((d) =>
      d.entrepriseId === form.entrepriseId && d.annee === parseInt(form.annee) && d.trimestre === parseInt(form.trimestre) && d.id !== editing?.id
    ) || null;
  }, [form.entrepriseId, form.annee, form.trimestre, declarations, editing]);

  const canEdit = (d: Declaration) =>
    isSuperAdmin || (d.statut !== "VALIDE" && (isAdmin || (isAgent && d.saisiePar === userId)));
  const canDecide = (d: Declaration) =>
    d.statut === "EN_ATTENTE" && (isSuperAdmin || (userRole === "ADMIN" && d.saisiePar !== userId));

  // ---------------------------------------------------------------- formulaire
  const resetForm = () => {
    setForm({ entrepriseId: "", annee: String(ANNEE_COURANTE), trimestre: String(trimestreCourant()), chiffreAffaires: "", effectifs: "", commentaire: "" });
    setLignes([ligneVide()]);
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (d: Declaration) => {
    setEditing(d);
    setForm({
      entrepriseId: d.entrepriseId,
      annee: String(d.annee ?? ANNEE_COURANTE),
      trimestre: String(d.trimestre ?? 1),
      chiffreAffaires: d.chiffreAffaires != null ? String(d.chiffreAffaires / MILLION) : "",
      effectifs: d.effectifs != null ? String(d.effectifs) : "",
      commentaire: d.commentaire || "",
    });
    setLignes(d.lignes.length
      ? d.lignes.map((l) => ({ produitId: l.produitId || "", produit: l.produit, quantite: String(l.quantite), unite: l.unite, nouveau: !l.produitId }))
      : [ligneVide()]);
    setShowForm(true);
  };

  const setLigne = (i: number, patch: Partial<LigneForm>) => setLignes(lignes.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const choisirProduit = (i: number, value: string) => {
    if (value === "__nouveau__") return setLigne(i, { nouveau: true, produitId: "", produit: "" });
    const p = catalogue.find((c) => c.id === value);
    setLigne(i, p ? { produitId: p.id, produit: p.nom, unite: p.unite, nouveau: false } : { produitId: "", produit: "" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const lignesValides = lignes.filter((l) => l.produit.trim());
    if (!form.entrepriseId) return alert("Choisissez une entreprise");
    if (lignesValides.length === 0) return alert("Ajoutez au moins un produit");
    if (lignesValides.some((l) => l.quantite === "" || isNaN(parseFloat(l.quantite)))) return alert("Indiquez la quantité de chaque produit");
    if (doublon) return alert("Une déclaration existe déjà pour cette entreprise sur ce trimestre");

    setSubmitting(true);
    try {
      const res = await fetch(editing ? `/api/production/${editing.id}` : "/api/productions", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrepriseId: form.entrepriseId,
          annee: parseInt(form.annee),
          trimestre: parseInt(form.trimestre),
          chiffreAffaires: form.chiffreAffaires ? parseFloat(form.chiffreAffaires) * MILLION : null,
          effectifs: form.effectifs ? parseInt(form.effectifs) : null,
          commentaire: form.commentaire,
          lignes: lignesValides.map((l) => ({ produitId: l.produitId || null, produit: l.produit.trim(), quantite: parseFloat(l.quantite), unite: l.unite })),
        }),
      });
      if (res.ok) {
        alert(editing?.statut === "REJETE" ? "Déclaration corrigée et resoumise pour validation." : editing ? "Déclaration modifiée." : "Déclaration enregistrée : elle est en attente de validation.");
        resetForm();
        fetchAllData();
      } else {
        alert("Erreur : " + ((await res.json().catch(() => ({}))).error || "enregistrement impossible"));
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------- actions
  const handleDelete = async (d: Declaration) => {
    if (!confirm(`Supprimer la déclaration ${d.entreprise.denomination} T${d.trimestre} ${d.annee} ?`)) return;
    const res = await fetch(`/api/production/${d.id}`, { method: "DELETE" });
    if (res.ok) fetchAllData();
    else alert("Erreur : " + ((await res.json().catch(() => ({}))).error || "suppression impossible"));
  };

  const decide = async (d: Declaration, statut: "VALIDE" | "REJETE", motifRejet?: string) => {
    const res = await fetch(`/api/admin/productions/${d.id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut, motif: motifRejet }),
    });
    if (res.ok) {
      setRejet(null);
      setMotif("");
      fetchAllData();
    } else {
      alert("Erreur : " + ((await res.json().catch(() => ({}))).error || "opération impossible"));
    }
  };

  const visibles = useMemo(() => {
    const q = normaliser(searchTerm);
    return declarations.filter((d) => {
      if (filterAnnee && d.annee !== parseInt(filterAnnee)) return false;
      if (filterTrimestre && d.trimestre !== parseInt(filterTrimestre)) return false;
      if (filterStatut && d.statut !== filterStatut) return false;
      if (!q) return true;
      return [d.entreprise.denomination, d.entreprise.sigle, d.entreprise.referenceSPI, d.entreprise.secteurActivite, ...d.lignes.map((l) => l.produit)]
        .some((v) => normaliser(v).includes(q));
    });
  }, [declarations, searchTerm, filterAnnee, filterTrimestre, filterStatut]);

  const aValider = visibles.filter(canDecide);

  const handleValidateAll = async () => {
    if (aValider.length === 0) return;
    if (!confirm(`Valider ${aValider.length} déclaration(s) affichée(s) ?`)) return;
    setValidateAllLoading(true);
    let ok = 0;
    for (const d of aValider) {
      const res = await fetch(`/api/admin/productions/${d.id}/validate`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut: "VALIDE" }),
      }).catch(() => null);
      if (res?.ok) ok++;
    }
    setValidateAllLoading(false);
    alert(`${ok} déclaration(s) validée(s)` + (ok < aValider.length ? `, ${aValider.length - ok} erreur(s)` : ""));
    fetchAllData();
  };

  // ---------------------------------------------------------------- export / import
  const exportCSV = () => {
    const header = ["Reference SPI", "Entreprise", "Annee", "Trimestre", "Produit", "Quantite", "Unite", "CA (FCFA)", "Effectifs", "Statut", "Motif rejet"];
    const rows: (string | number)[][] = [];
    visibles.forEach((d) => {
      const base = [d.entreprise.referenceSPI, d.entreprise.denomination, d.annee ?? "", "T" + d.trimestre];
      const fin = [d.chiffreAffaires ?? "", d.effectifs ?? "", d.statut, d.motifRejet ?? ""];
      if (d.lignes.length === 0) rows.push([...base, "", "", "", ...fin]);
      d.lignes.forEach((l) => rows.push([...base, l.produit, l.quantite, l.unite, ...fin]));
    });
    const csv = "﻿" + [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = `declarations_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  // Une ligne CSV = un produit ; les lignes d'une même entreprise et d'un même trimestre forment une déclaration
  const handleImport = async () => {
    if (!importFile) return;
    setImportLoading(true);
    const result: ImportResult = { success: 0, errors: 0, total: 0, details: [] };
    try {
      const rows = parseCSV(await importFile.text());
      const groupes = new Map<string, { ent: Enterprise; annee: number; trimestre: number; ca: number | null; eff: number | null; com: string; lignes: Ligne[]; rows: number[] }>();
      rows.forEach((r, idx) => {
        const n = idx + 2; // numéro de ligne dans le fichier (en-tête = 1)
        const ref = r.reference_spi || r.referencespi || "";
        const id = r.entreprise_id || r.entrepriseid || "";
        const ent = entreprisesActives.find((e) => (id && e.id === id) || (ref && normaliser(e.referenceSPI) === normaliser(ref)));
        const annee = parseInt(r.annee);
        const trimestre = parseInt((r.trimestre || "").replace(/^t/i, ""));
        const quantite = parseFloat((r.quantite || "").replace(",", "."));
        if (!ent) { result.errors++; result.details.push({ row: "L" + n, ok: false, message: `Entreprise active introuvable (${ref || id || "vide"})` }); return; }
        if (!annee || !(trimestre >= 1 && trimestre <= 4)) { result.errors++; result.details.push({ row: "L" + n, ok: false, message: "Année ou trimestre invalide" }); return; }
        if (!r.produit || isNaN(quantite)) { result.errors++; result.details.push({ row: "L" + n, ok: false, message: "Produit ou quantité manquant" }); return; }
        const key = `${ent.id}|${annee}|${trimestre}`;
        const g = groupes.get(key) || { ent, annee, trimestre, ca: null, eff: null, com: "", lignes: [], rows: [] };
        g.lignes.push({ produit: r.produit, quantite, unite: r.unite || "t" });
        g.rows.push(n);
        if (r.chiffre_affaires) g.ca = parseFloat(r.chiffre_affaires.replace(",", "."));
        if (r.effectifs) g.eff = parseInt(r.effectifs);
        if (r.commentaire) g.com = r.commentaire;
        groupes.set(key, g);
      });
      result.total = groupes.size + result.errors;
      for (const g of Array.from(groupes.values())) {
        const res = await fetch("/api/productions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entrepriseId: g.ent.id, annee: g.annee, trimestre: g.trimestre, chiffreAffaires: g.ca, effectifs: g.eff, commentaire: g.com, lignes: g.lignes }),
        });
        const where = `L${g.rows.join(",")}`;
        if (res.ok) { result.success++; result.details.push({ row: where, ok: true, message: `${g.ent.denomination} T${g.trimestre} ${g.annee} : ${g.lignes.length} produit(s)` }); }
        else { result.errors++; result.details.push({ row: where, ok: false, message: (await res.json().catch(() => ({}))).error || "Erreur API" }); }
      }
    } catch (e: any) {
      result.errors++;
      result.details.push({ row: "-", ok: false, message: e?.message || "Fichier illisible" });
    }
    setImportResult(result);
    setImportLoading(false);
    if (result.success > 0) fetchAllData();
  };

  // ---------------------------------------------------------------- rendu
  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Chargement...</div>;
  }

  if (showForm) {
    const ent = enterprises.find((e) => e.id === form.entrepriseId);
    const estimation = isEstimation(parseInt(form.annee), parseInt(form.trimestre));
    const produitsUtilises = new Set(lignes.map((l) => l.produitId).filter(Boolean));
    return (
      <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
        <button onClick={resetForm} style={{ ...btn, border: "none", padding: 0, marginBottom: "24px", background: "none" }}><ArrowLeft size={16} /> Retour aux déclarations</button>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 4px", color: "#111827" }}>{editing ? "Modifier la déclaration" : "Nouvelle déclaration trimestrielle"}</h1>
        <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: "14px" }}>Une déclaration par entreprise et par trimestre, avec un ou plusieurs produits.</p>

        {editing?.statut === "REJETE" && editing.motifRejet && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b", marginBottom: "20px", fontSize: "14px" }}>
            <strong>Motif du rejet :</strong> {editing.motifRejet}<br />
            <span style={{ fontSize: "13px" }}>Corrigez puis enregistrez : la déclaration repartira en validation.</span>
          </div>
        )}
        {editing?.statut === "VALIDE" && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fef3c7", color: "#92400e", marginBottom: "20px", fontSize: "14px" }}>
            Cette déclaration est déjà validée. La modification sera tracée dans le journal d&apos;audit.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", margin: "0 0 12px" }}><Building2 size={18} /> Entreprise et période</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
            <div>
              <label style={label}>Entreprise <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={form.entrepriseId} disabled={!!editing} onChange={(e) => { setForm({ ...form, entrepriseId: e.target.value }); setLignes([ligneVide()]); }} style={input}>
                <option value="">Choisir une entreprise...</option>
                {(editing ? enterprises : entreprisesActives).map((e) => (
                  <option key={e.id} value={e.id}>{e.denomination}{e.sigle ? ` (${e.sigle})` : ""}</option>
                ))}
              </select>
              {ent && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#6b7280" }}>{ent.secteurActivite} · Réf {ent.referenceSPI}</p>}
            </div>
            <div>
              <label style={label}>Année <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={form.annee} onChange={(e) => setForm({ ...form, annee: e.target.value })} style={input}>
                {ANNEES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Trimestre <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={form.trimestre} onChange={(e) => setForm({ ...form, trimestre: e.target.value })} style={input}>
                <option value="1">T1 (janv. – mars)</option><option value="2">T2 (avr. – juin)</option>
                <option value="3">T3 (juil. – sept.)</option><option value="4">T4 (oct. – déc.)</option>
              </select>
            </div>
          </div>
          {doublon && (
            <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} /> Une déclaration existe déjà pour ce trimestre ({STATUT[doublon.statut].label}).
              {canEdit(doublon) && <button type="button" onClick={() => openEdit(doublon)} style={{ ...btn, padding: "4px 10px", fontSize: "12px" }}>La modifier</button>}
            </div>
          )}
          {estimation && (
            <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "#fef3c7", color: "#92400e", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Eye size={16} /> Période future : les données seront affichées comme estimation.
            </div>
          )}

          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", margin: "28px 0 12px" }}><Package size={18} /> Produits du trimestre</h3>
          {!form.entrepriseId ? (
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>Choisissez d&apos;abord une entreprise.</p>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 2fr) minmax(90px, 1.2fr) 100px 40px", gap: "8px", padding: "10px 12px", background: "#f9fafb", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                <div>Produit</div><div>Quantité</div><div>Unité</div><div />
              </div>
              {lignes.map((l, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(140px, 2fr) minmax(90px, 1.2fr) 100px 40px", gap: "8px", padding: "8px 12px", borderTop: "1px solid #f3f4f6", alignItems: "center" }}>
                  {l.nouveau ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input autoFocus placeholder="Nom du nouveau produit" value={l.produit} onChange={(e) => setLigne(i, { produit: e.target.value })} style={input} />
                      {catalogue.length > 0 && <button type="button" title="Choisir dans le catalogue" onClick={() => setLigne(i, { nouveau: false, produit: "" })} style={{ ...btn, padding: "6px 8px" }}>↩</button>}
                    </div>
                  ) : (
                    <select value={l.produitId} onChange={(e) => choisirProduit(i, e.target.value)} style={input}>
                      <option value="">Choisir un produit...</option>
                      {catalogue.filter((p) => p.id === l.produitId || !produitsUtilises.has(p.id)).map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                      <option value="__nouveau__">+ Nouveau produit…</option>
                    </select>
                  )}
                  <input type="number" step="any" min="0" placeholder="0" value={l.quantite} onChange={(e) => setLigne(i, { quantite: e.target.value })} style={input} />
                  <select value={l.unite} onChange={(e) => setLigne(i, { unite: e.target.value })} style={input}>
                    {!UNITES.includes(l.unite) && <option value={l.unite}>{l.unite}</option>}
                    {UNITES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button type="button" title="Retirer" disabled={lignes.length === 1} onClick={() => setLignes(lignes.filter((_, j) => j !== i))} style={{ ...btn, padding: "6px", color: "#dc2626", opacity: lignes.length === 1 ? 0.3 : 1 }}><X size={14} /></button>
                </div>
              ))}
              <div style={{ padding: "10px 12px", borderTop: "1px solid #f3f4f6" }}>
                <button type="button" onClick={() => setLignes([...lignes, { ...ligneVide(), nouveau: catalogue.length === 0 }])} style={{ ...btn, fontSize: "13px" }}><Plus size={14} /> Ajouter un produit</button>
                {catalogue.length === 0 && <span style={{ marginLeft: "10px", fontSize: "12px", color: "#9ca3af" }}>Aucun produit au catalogue : les produits saisis y seront ajoutés.</span>}
              </div>
            </div>
          )}

          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", margin: "28px 0 12px" }}><DollarSign size={18} /> Données de l&apos;entreprise sur le trimestre</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={label}>Chiffre d&apos;affaires total</label>
              <div style={{ position: "relative" }}>
                <input type="number" step="any" min="0" placeholder="0" value={form.chiffreAffaires} onChange={(e) => setForm({ ...form, chiffreAffaires: e.target.value })} style={{ ...input, paddingRight: "90px" }} />
                <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af" }}>millions FCFA</span>
              </div>
            </div>
            <div>
              <label style={label}><Users size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Effectif total</label>
              <input type="number" min="0" placeholder="0" value={form.effectifs} onChange={(e) => setForm({ ...form, effectifs: e.target.value })} style={input} />
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <label style={label}><MessageSquare size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Commentaire</label>
            <textarea rows={3} value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} style={{ ...input, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "24px" }}>
            <button type="button" onClick={resetForm} style={btn}>Annuler</button>
            <button type="submit" disabled={submitting || !form.entrepriseId || !!doublon} style={{ ...btnPrimary, opacity: submitting || !form.entrepriseId || doublon ? 0.5 : 1 }}>
              <Save size={16} /> {submitting ? "Enregistrement..." : editing?.statut === "REJETE" ? "Corriger et resoumettre" : editing ? "Enregistrer" : "Soumettre pour validation"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const nbAttente = visibles.filter((d) => d.statut === "EN_ATTENTE").length;
  const nbValide = visibles.filter((d) => d.statut === "VALIDE").length;
  const nbRejete = visibles.filter((d) => d.statut === "REJETE").length;
  const mesRejets = isAgent ? declarations.filter((d) => d.statut === "REJETE").length : 0;
  const caValide = visibles.filter((d) => d.statut === "VALIDE").reduce((s, d) => s + (d.chiffreAffaires || 0), 0);
  const nbEntreprises = new Set(visibles.map((d) => d.entrepriseId)).size;
  const nbProduits = visibles.reduce((s, d) => s + d.lignes.length, 0);

  return (
    <div style={{ padding: "24px" }}>
      {message && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: "#fee2e2", color: "#dc2626", fontSize: "14px" }}>{message}</div>}

      {/* Modale de rejet */}
      {rejet && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "100%", maxWidth: "480px" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "18px" }}>Rejeter la déclaration</h2>
            <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: "14px" }}>{rejet.entreprise.denomination} — T{rejet.trimestre} {rejet.annee}. L&apos;agent verra ce motif pour corriger.</p>
            <textarea autoFocus rows={4} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif du rejet (obligatoire)" style={{ ...input, resize: "vertical" }} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => { setRejet(null); setMotif(""); }} style={btn}>Annuler</button>
              <button disabled={!motif.trim()} onClick={() => decide(rejet, "REJETE", motif)} style={{ ...btnPrimary, background: "#dc2626", opacity: motif.trim() ? 1 : 0.5 }}>Rejeter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'import */}
      {showImport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "12px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", margin: 0 }}>Importer des déclarations (CSV)</h2>
              <button onClick={() => setShowImport(false)} style={{ ...btn, border: "none", padding: "4px" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151" }}>Une ligne par produit. Les lignes d&apos;une même entreprise et d&apos;un même trimestre forment une seule déclaration. Séparateur « ; » ou « , ».</p>
              <code style={{ display: "block", padding: "10px 12px", background: "#1f2937", color: "#e5e7eb", borderRadius: "6px", fontSize: "12px", whiteSpace: "pre", overflow: "auto" }}>
{`reference_spi;annee;trimestre;produit;quantite;unite;chiffre_affaires;effectifs;commentaire
SPI-CAM-005;2026;2;Ciment CPJ 42.5;125000;t;4500000000;850;
SPI-CAM-005;2026;2;Ciment CPJ 32.5;40000;t;;;`}
              </code>
              <p style={{ margin: "8px 0 16px", fontSize: "12px", color: "#6b7280" }}>chiffre_affaires en FCFA. La colonne entreprise_id peut remplacer reference_spi.</p>
              {!importResult && (
                <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed #d1d5db", borderRadius: "12px", padding: "32px", textAlign: "center", cursor: "pointer", background: "#f9fafb" }}>
                  <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
                  <Upload size={28} color="#6b7280" />
                  <p style={{ margin: "8px 0 0", fontSize: "14px" }}>{importFile ? importFile.name : "Cliquer pour choisir un fichier .csv"}</p>
                </div>
              )}
              {importResult && (
                <div>
                  <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "12px", background: importResult.errors === 0 ? "#d1fae5" : importResult.success ? "#fef3c7" : "#fee2e2", fontWeight: 600, fontSize: "14px" }}>
                    {importResult.success} déclaration(s) importée(s), {importResult.errors} erreur(s)
                  </div>
                  <div style={{ maxHeight: "220px", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    {importResult.details.map((d, i) => (
                      <div key={i} style={{ padding: "6px 12px", borderBottom: "1px solid #f3f4f6", fontSize: "13px", display: "flex", gap: "8px", color: d.ok ? "#059669" : "#dc2626" }}>
                        {d.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}<span style={{ color: "#6b7280", minWidth: "60px" }}>{d.row}</span>{d.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button onClick={() => { setShowImport(false); setImportFile(null); setImportResult(null); }} style={btn}>Fermer</button>
                {importFile && !importResult && <button disabled={importLoading} onClick={handleImport} style={{ ...btnPrimary, opacity: importLoading ? 0.5 : 1 }}><Upload size={14} /> {importLoading ? "Import en cours..." : "Importer"}</button>}
                {importResult && <button onClick={() => { setImportFile(null); setImportResult(null); }} style={btn}>Nouvel import</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "#d1fae5", borderRadius: "8px" }}><Factory size={22} color="#059669" /></div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0, color: "#111827" }}>Production</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
              {isAgent ? "Vos déclarations trimestrielles" : "Déclarations trimestrielles des entreprises"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={exportCSV} style={btn}><Download size={16} /> Exporter CSV</button>
          <button onClick={() => { setShowImport(true); setImportFile(null); setImportResult(null); }} style={btn}><Upload size={16} /> Importer CSV</button>
          <button onClick={() => setShowForm(true)} style={btnPrimary}><Plus size={16} /> Nouvelle déclaration</button>
        </div>
      </div>

      {isAgent && mesRejets > 0 && filterStatut !== "REJETE" && (
        <button onClick={() => setFilterStatut("REJETE")} style={{ width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fee2e2", color: "#991b1b", marginBottom: "16px", cursor: "pointer", fontSize: "14px" }}>
          ❌ <strong>{mesRejets}</strong> déclaration(s) rejetée(s) à corriger — cliquer pour les afficher
        </button>
      )}

      {/* Statuts (cliquables = filtre) */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {([["EN_ATTENTE", nbAttente, "En attente"], ["VALIDE", nbValide, "Validées"], ["REJETE", nbRejete, "Rejetées"]] as const).map(([key, n, lib]) => {
          const st = STATUT[key];
          return (
            <KpiCard key={key} label={lib} value={n} icon={<st.Icon size={16} color={st.color} />} accent=""
              onClick={() => setFilterStatut(filterStatut === key ? "" : key)} actif={filterStatut === key} />
          );
        })}
      </div>

      <KpiGrid>
        <KpiCard label="Déclarations" value={visibles.length} sub="affichées" icon={<Factory size={16} />} accent="bg-emerald-100 text-emerald-700" />
        <KpiCard label="Entreprises déclarantes" value={nbEntreprises} sub="distinctes" icon={<Building2 size={16} />} accent="bg-blue-100 text-blue-700" />
        <KpiCard label="Lignes produit" value={nbProduits} sub="produits déclarés" icon={<Package size={16} />} accent="bg-amber-100 text-amber-700" />
        <KpiCard label="CA validé" value={fmt(caValide / MILLION, 1)} sub="millions de FCFA" icon={<DollarSign size={16} />} accent="bg-violet-100 text-violet-700" />
      </KpiGrid>

      {/* Filtres */}
      <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input placeholder="Entreprise, référence, produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...input, paddingLeft: "34px" }} />
        </div>
        <select value={filterAnnee} onChange={(e) => setFilterAnnee(e.target.value)} style={input}>
          <option value="">Toutes les années</option>
          {Array.from(new Set(declarations.map((d) => d.annee).filter(Boolean))).sort().reverse().map((a) => <option key={a!} value={a!}>{a}</option>)}
        </select>
        <select value={filterTrimestre} onChange={(e) => setFilterTrimestre(e.target.value)} style={input}>
          <option value="">Tous les trimestres</option>
          {[1, 2, 3, 4].map((t) => <option key={t} value={t}>T{t}</option>)}
        </select>
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} style={input}>
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option><option value="VALIDE">Validées</option><option value="REJETE">Rejetées</option>
        </select>
      </div>

      {isAdmin && aValider.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
          <button onClick={handleValidateAll} disabled={validateAllLoading} style={{ ...btnPrimary, opacity: validateAllLoading ? 0.5 : 1 }}>
            <CheckSquare size={16} /> {validateAllLoading ? "Validation..." : `Valider les ${aValider.length} déclaration(s) affichée(s)`}
          </button>
        </div>
      )}

      {/* Liste */}
      {visibles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "white" }}>
          <Factory size={40} color="#9ca3af" />
          <h3 style={{ fontSize: "16px", margin: "12px 0 6px" }}>Aucune déclaration</h3>
          <p style={{ color: "#6b7280", margin: 0 }}>Ajustez les filtres ou créez une nouvelle déclaration.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {visibles.map((d) => {
            const s = STATUT[d.statut] || STATUT.EN_ATTENTE;
            const ouvert = ouverts.has(d.id);
            const toggle = () => { const n = new Set(ouverts); ouvert ? n.delete(d.id) : n.add(d.id); setOuverts(n); };
            return (
              <div key={d.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", flexWrap: "wrap" }}>
                  <button onClick={toggle} title={ouvert ? "Masquer le détail" : "Voir le détail"} style={{ ...btn, padding: "6px" }}>{ouvert ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <p style={{ fontWeight: 600, margin: 0, color: "#111827" }}>{d.entreprise.denomination}{d.entreprise.sigle ? ` (${d.entreprise.sigle})` : ""}</p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap", fontSize: "12px" }}>
                      <span style={{ padding: "2px 8px", border: "1px solid #e5e7eb", borderRadius: "4px" }}><Calendar size={11} style={{ display: "inline", verticalAlign: "-1px" }} /> T{d.trimestre} {d.annee}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", background: s.bg, color: s.color, display: "inline-flex", alignItems: "center", gap: "4px" }}><s.Icon size={11} /> {s.label}</span>
                      {isEstimation(d.annee, d.trimestre) && <span style={{ padding: "2px 8px", borderRadius: "4px", background: "#fef3c7", color: "#d97706" }}>Estimation</span>}
                      <span style={{ padding: "2px 8px", borderRadius: "4px", background: "#f3f4f6" }}>{d.lignes.length} produit{d.lignes.length > 1 ? "s" : ""}</span>
                    </div>
                    {d.statut === "REJETE" && d.motifRejet && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#991b1b" }}>Motif : {d.motifRejet}</p>}
                  </div>
                  <div style={{ textAlign: "right", fontSize: "13px", minWidth: "140px" }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{fmtMFCFA(d.chiffreAffaires)}</p>
                    <p style={{ margin: "2px 0 0", color: "#6b7280" }}>{fmt(d.effectifs)} employés</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {canDecide(d) && (
                      <>
                        <button onClick={() => decide(d, "VALIDE")} style={{ ...btnPrimary, padding: "6px 10px", fontSize: "12px" }}><CheckCircle2 size={12} /> Valider</button>
                        <button onClick={() => setRejet(d)} style={{ ...btnPrimary, background: "#dc2626", padding: "6px 10px", fontSize: "12px" }}><XCircle size={12} /> Rejeter</button>
                      </>
                    )}
                    {canEdit(d) && <button onClick={() => openEdit(d)} title="Modifier" style={{ ...btn, padding: "6px" }}><Pencil size={14} /></button>}
                    {canEdit(d) && <button onClick={() => handleDelete(d)} title="Supprimer" style={{ ...btn, padding: "6px", borderColor: "#ef4444", color: "#ef4444" }}><Trash2 size={14} /></button>}
                  </div>
                </div>
                {ouvert && (
                  <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 16px 16px 60px", fontSize: "13px" }}>
                    <table style={{ width: "100%", maxWidth: "560px", borderCollapse: "collapse" }}>
                      <thead><tr style={{ color: "#6b7280", textAlign: "left" }}><th style={{ padding: "4px 0" }}>Produit</th><th style={{ textAlign: "right" }}>Quantité</th><th style={{ paddingLeft: "8px" }}>Unité</th></tr></thead>
                      <tbody>
                        {d.lignes.map((l) => (
                          <tr key={l.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "6px 0" }}>{l.produit}</td><td style={{ textAlign: "right" }}>{fmt(l.quantite, 2)}</td><td style={{ paddingLeft: "8px", color: "#6b7280" }}>{l.unite}</td>
                          </tr>
                        ))}
                        {d.lignes.length === 0 && <tr><td colSpan={3} style={{ color: "#9ca3af", padding: "6px 0" }}>Aucun produit</td></tr>}
                      </tbody>
                    </table>
                    {d.commentaire && <p style={{ margin: "10px 0 0", color: "#6b7280", fontStyle: "italic" }}>« {d.commentaire} »</p>}
                    <p style={{ margin: "10px 0 0", color: "#9ca3af", fontSize: "12px" }}>
                      Saisie par {d.agentSaisie?.name || d.agentSaisie?.email || "—"} le {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      {d.adminValidation && d.dateValidation && ` · ${d.statut === "VALIDE" ? "Validée" : "Traitée"} par ${d.adminValidation.name || d.adminValidation.email} le ${new Date(d.dateValidation).toLocaleDateString("fr-FR")}`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
