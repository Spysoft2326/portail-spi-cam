"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, Search, KeyRound, Pencil, Trash2, Power, ShieldCheck, Lock, X } from "lucide-react";
import { LIBELLE_ROLE, MOT_DE_PASSE_PAR_DEFAUT, DOMAINE_EMAIL, emailDepuisIdentifiant, rolesAttribuables, type Role } from "@/lib/rbac";

interface Compte {
  id: string;
  name: string | null;
  email: string | null;
  identifiant: string | null;
  role: Role;
  actif: boolean;
  doitChangerMotDePasse: boolean;
  derniereConnexion: string | null;
  bloqueJusqua: string | null;
  modifiable: boolean;
  estMoi: boolean;
}

const COULEUR_ROLE: Record<string, { bg: string; color: string }> = {
  SUPER_ADMIN: { bg: "#dbeafe", color: "#1d4ed8" },
  ADMIN: { bg: "#d1fae5", color: "#059669" },
  AGENT_SAISIE: { bg: "#fef3c7", color: "#d97706" },
};
const FORM_VIDE = { name: "", identifiant: "", email: "", role: "AGENT_SAISIE" as Role };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" } as const;
const label = { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 } as const;
const btn = { padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" } as const;
const btnPrimary = { ...btn, border: "none", background: "#059669", color: "white" } as const;

/**
 * Gestion des comptes, selon la politique « qui peut le plus peut le moins » (lib/rbac.ts) :
 *  - super admin : crée les comptes, attribue les rôles, modifie / désactive / supprime ;
 *  - admin : modifie les agents de saisie (informations, activation, réinitialisation du mot de passe).
 * Les données viennent de l'API protégée /api/admin/users (la prop `users` n'est plus utilisée).
 */
export default function UsersContent(_props: { users?: unknown }) {
  const { data: session } = useSession();
  const role = (session?.user?.role as string) || "";
  const estSuperAdmin = role === "SUPER_ADMIN";
  const roles = rolesAttribuables(role);

  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [formOuvert, setFormOuvert] = useState(false);
  const [edition, setEdition] = useState<Compte | null>(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  const charger = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    setComptes(res.ok ? await res.json() : []);
    setLoading(false);
  };
  useEffect(() => { if (session) charger(); }, [session]);

  const notifier = (ok: boolean, texte: string) => {
    setMessage({ ok, texte });
    setTimeout(() => setMessage(null), 6000);
  };

  const fermer = () => { setFormOuvert(false); setEdition(null); setForm(FORM_VIDE); };

  const ouvrirEdition = (c: Compte) => {
    setEdition(c);
    setForm({ name: c.name || "", identifiant: c.identifiant || "", email: c.email || "", role: c.role });
    setFormOuvert(true);
  };

  const appel = async (url: string, method: string, body?: object) => {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Opération impossible");
    return data;
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      if (edition) {
        const data: any = { name: form.name, identifiant: form.identifiant, email: form.email };
        if (estSuperAdmin && form.role !== edition.role) data.role = form.role;
        await appel(`/api/admin/users/${edition.id}`, "PATCH", data);
        notifier(true, "Compte modifié.");
      } else {
        await appel("/api/admin/users", "POST", form);
        notifier(true, `Compte créé. Mot de passe provisoire : ${MOT_DE_PASSE_PAR_DEFAUT} (à changer à la première connexion).`);
      }
      fermer();
      charger();
    } catch (err: any) {
      notifier(false, err.message);
    } finally {
      setEnvoi(false);
    }
  };

  const action = async (c: Compte, type: "reinit" | "activer" | "supprimer") => {
    const nom = c.name || c.identifiant || c.email;
    const questions = {
      reinit: `Réinitialiser le mot de passe de ${nom} ? Il redeviendra « ${MOT_DE_PASSE_PAR_DEFAUT} » et devra être changé à la prochaine connexion.`,
      activer: c.actif ? `Désactiver le compte de ${nom} ? Il ne pourra plus se connecter.` : `Réactiver le compte de ${nom} ?`,
      supprimer: `Supprimer définitivement le compte de ${nom} ? Ses saisies passées sont conservées. Préférez la désactivation si vous hésitez.`,
    };
    if (!confirm(questions[type])) return;
    try {
      if (type === "supprimer") await appel(`/api/admin/users/${c.id}`, "DELETE");
      else await appel(`/api/admin/users/${c.id}`, "PATCH", type === "reinit" ? { reinitialiserMotDePasse: true } : { actif: !c.actif });
      notifier(true, type === "reinit" ? `Mot de passe réinitialisé à « ${MOT_DE_PASSE_PAR_DEFAUT} ».` : type === "activer" ? "Statut du compte modifié." : "Compte supprimé.");
      charger();
    } catch (err: any) {
      notifier(false, err.message);
    }
  };

  const q = recherche.trim().toLowerCase();
  const visibles = comptes.filter((c) => !q || [c.name, c.identifiant, c.email, LIBELLE_ROLE[c.role]].some((v) => (v || "").toLowerCase().includes(q)));
  const compte = (r: Role) => comptes.filter((c) => c.role === r).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {(["SUPER_ADMIN", "ADMIN", "AGENT_SAISIE"] as Role[]).map((r) => (
          <div key={r} style={{ padding: "14px 16px", borderRadius: "10px", background: COULEUR_ROLE[r].bg }}>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: COULEUR_ROLE[r].color }}>{compte(r)}</p>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: COULEUR_ROLE[r].color }}>{LIBELLE_ROLE[r]}{compte(r) > 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "13px", color: "#475569", marginBottom: "20px", display: "flex", gap: "10px" }}>
        <ShieldCheck size={18} style={{ flexShrink: 0, color: "#059669" }} />
        <span>
          <strong>Qui peut le plus peut le moins :</strong> super administrateur &gt; administrateur &gt; agent de saisie.{" "}
          {estSuperAdmin
            ? "Vous créez les comptes et attribuez les rôles."
            : "Vous pouvez modifier les comptes des agents de saisie ; la création des comptes et l'attribution des rôles relèvent du super administrateur."}{" "}
          Chaque nouveau compte reçoit le mot de passe provisoire « {MOT_DE_PASSE_PAR_DEFAUT} », à changer obligatoirement à la première connexion.
        </span>
      </div>

      {message && (
        <div role="status" style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", background: message.ok ? "#d1fae5" : "#fee2e2", color: message.ok ? "#065f46" : "#991b1b" }}>
          {message.texte}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input placeholder="Rechercher un nom, un identifiant, un email..." value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ ...input, paddingLeft: "34px" }} />
        </div>
        {estSuperAdmin && <button onClick={() => { setEdition(null); setForm(FORM_VIDE); setFormOuvert(true); }} style={btnPrimary}><UserPlus size={16} /> Nouveau compte</button>}
      </div>

      {formOuvert && (
        <form onSubmit={soumettre} style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{edition ? `Modifier le compte de ${edition.name || edition.identifiant}` : "Nouveau compte"}</h3>
            <button type="button" onClick={fermer} style={{ ...btn, border: "none", padding: "4px" }} aria-label="Fermer"><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={label}>Nom complet *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} />
            </div>
            <div>
              <label style={label}>Identifiant de connexion</label>
              <input
                value={form.identifiant}
                // L'email suit l'identifiant : identifiant@spi-cam.cm
                onChange={(e) => setForm({ ...form, identifiant: e.target.value, email: emailDepuisIdentifiant(e.target.value) || "" })}
                placeholder="ex : jdupont" style={input} autoCapitalize="none"
              />
            </div>
            <div>
              <label style={label}>Email {form.identifiant.trim() && <span style={{ fontWeight: 400, color: "#6b7280", fontSize: "12px" }}>(généré automatiquement)</span>}</label>
              <input
                type="email"
                value={form.identifiant.trim() ? emailDepuisIdentifiant(form.identifiant) || "" : form.email}
                readOnly={!!form.identifiant.trim()}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={`identifiant@${DOMAINE_EMAIL}`}
                style={{ ...input, ...(form.identifiant.trim() ? { background: "#f3f4f6", color: "#374151" } : {}) }}
              />
            </div>
            <div>
              <label style={label}>Rôle</label>
              <select value={form.role} disabled={!estSuperAdmin || edition?.estMoi} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} style={input}>
                {(roles.length ? roles : [form.role]).map((r) => <option key={r} value={r}>{LIBELLE_ROLE[r]}</option>)}
              </select>
            </div>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#6b7280" }}>L'email est composé de l'identifiant et du domaine {DOMAINE_EMAIL}. On peut se connecter avec l'un ou l'autre.</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button type="button" onClick={fermer} style={btn}>Annuler</button>
            <button type="submit" disabled={envoi} style={{ ...btnPrimary, opacity: envoi ? 0.5 : 1 }}>{envoi ? "Enregistrement..." : edition ? "Enregistrer" : "Créer le compte"}</button>
          </div>
        </form>
      )}

      <div style={{ borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", overflowX: "auto" }}>
        {loading ? (
          <p style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Chargement des comptes...</p>
        ) : visibles.length === 0 ? (
          <p style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Aucun compte.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "760px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left", color: "#6b7280", fontSize: "12px", textTransform: "uppercase" }}>
                <th style={{ padding: "12px 16px" }}>Utilisateur</th>
                <th style={{ padding: "12px 16px" }}>Connexion</th>
                <th style={{ padding: "12px 16px" }}>Rôle</th>
                <th style={{ padding: "12px 16px" }}>Statut</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((c) => {
                const bloque = c.bloqueJusqua && new Date(c.bloqueJusqua) > new Date();
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6", opacity: c.actif ? 1 : 0.55 }}>
                    <td style={{ padding: "12px 16px" }}>
                      <strong>{c.name || "—"}</strong>{c.estMoi && <span style={{ marginLeft: "6px", fontSize: "11px", color: "#6b7280" }}>(vous)</span>}
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{c.email || ""}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                      <span style={{ fontFamily: "monospace" }}>{c.identifiant || c.email}</span>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>{c.derniereConnexion ? `Dernière : ${new Date(c.derniereConnexion).toLocaleString("fr-FR")}` : "Jamais connecté"}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", background: COULEUR_ROLE[c.role]?.bg, color: COULEUR_ROLE[c.role]?.color }}>{LIBELLE_ROLE[c.role] || c.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px" }}>
                      {!c.actif ? <span style={{ color: "#6b7280" }}>Désactivé</span> : bloque ? <span style={{ color: "#dc2626", display: "inline-flex", alignItems: "center", gap: "4px" }}><Lock size={12} /> Bloqué (échecs)</span> : <span style={{ color: "#059669" }}>Actif</span>}
                      {c.doitChangerMotDePasse && <div style={{ color: "#d97706" }}>Mot de passe provisoire</div>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        {c.modifiable && (
                          <>
                            <button title="Modifier" onClick={() => ouvrirEdition(c)} style={{ ...btn, padding: "6px" }}><Pencil size={14} /></button>
                            <button title="Réinitialiser le mot de passe" onClick={() => action(c, "reinit")} style={{ ...btn, padding: "6px" }}><KeyRound size={14} /></button>
                            {!c.estMoi && <button title={c.actif ? "Désactiver" : "Réactiver"} onClick={() => action(c, "activer")} style={{ ...btn, padding: "6px" }}><Power size={14} /></button>}
                            {estSuperAdmin && !c.estMoi && <button title="Supprimer" onClick={() => action(c, "supprimer")} style={{ ...btn, padding: "6px", borderColor: "#ef4444", color: "#ef4444" }}><Trash2 size={14} /></button>}
                          </>
                        )}
                        {!c.modifiable && c.estMoi && <span style={{ fontSize: "12px", color: "#9ca3af" }}>Voir « Mon compte »</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
