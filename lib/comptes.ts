import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/declarations";
import { estRole, peutGererCompte, rolesAttribuables, MOT_DE_PASSE_PAR_DEFAUT, emailDepuisIdentifiant, type Role } from "@/lib/rbac";

/**
 * Gestion des comptes utilisateurs, selon la politique de lib/rbac.ts.
 * Toutes les fonctions lèvent une CompteError (message + code HTTP) en cas de refus.
 */
export class CompteError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

type Acteur = { id: string; role?: string | null };

/** Champs renvoyés au client : jamais le mot de passe haché. */
export const SELECT_COMPTE = {
  id: true, name: true, email: true, identifiant: true, role: true, actif: true,
  doitChangerMotDePasse: true, derniereConnexion: true, bloqueJusqua: true, createdAt: true,
} as const;

const RE_IDENTIFIANT = /^[a-z0-9._-]{3,40}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nettoyerIdentifiant(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  const id = String(v).trim().toLowerCase();
  if (!RE_IDENTIFIANT.test(id)) throw new CompteError("Identifiant invalide : 3 à 40 caractères parmi lettres, chiffres, point, tiret, tiret bas");
  return id;
}
function nettoyerEmail(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  const e = String(v).trim().toLowerCase();
  if (!RE_EMAIL.test(e)) throw new CompteError("Adresse email invalide");
  return e;
}
async function verifierUnicite(identifiant: string | null, email: string | null, sauf?: string) {
  if (identifiant && (await prisma.user.findFirst({ where: { identifiant, NOT: sauf ? { id: sauf } : undefined }, select: { id: true } }))) {
    throw new CompteError(`L'identifiant « ${identifiant} » est déjà utilisé`, 409);
  }
  if (email && (await prisma.user.findFirst({ where: { email, NOT: sauf ? { id: sauf } : undefined }, select: { id: true } }))) {
    throw new CompteError(`L'email ${email} est déjà utilisé`, 409);
  }
}
async function nombreSuperAdminsActifs(sauf?: string) {
  return prisma.user.count({ where: { role: "SUPER_ADMIN", actif: true, NOT: sauf ? { id: sauf } : undefined } });
}

/** Comptes visibles : tous pour le super admin ; les agents et soi-même pour un admin. */
export async function listerComptes(acteur: Acteur) {
  const where = acteur.role === "SUPER_ADMIN" ? {} : { OR: [{ role: "AGENT_SAISIE" }, { id: acteur.id }] };
  const comptes = await prisma.user.findMany({ where, select: SELECT_COMPTE, orderBy: [{ role: "desc" }, { name: "asc" }] });
  return comptes.map((c) => ({ ...c, modifiable: peutGererCompte(acteur, c), estMoi: c.id === acteur.id }));
}

/** Création d'un compte (super admin) avec le mot de passe par défaut, à changer à la 1re connexion. */
export async function creerCompte(acteur: Acteur, data: { name?: string; email?: string; identifiant?: string; role?: string }) {
  const role = data.role || "AGENT_SAISIE";
  if (!rolesAttribuables(acteur.role).includes(role as Role)) {
    throw new CompteError("Seul le super administrateur peut créer des comptes et attribuer des rôles", 403);
  }
  const name = String(data.name || "").trim();
  if (!name) throw new CompteError("Le nom est obligatoire");
  const identifiant = nettoyerIdentifiant(data.identifiant);
  // Email généré automatiquement : identifiant@spi-cam.cm (saisi seulement s'il n'y a pas d'identifiant)
  const email = identifiant ? emailDepuisIdentifiant(identifiant) : nettoyerEmail(data.email);
  if (!identifiant && !email) throw new CompteError("Indiquez un identifiant ou un email de connexion");
  await verifierUnicite(identifiant, email);

  const compte = await prisma.user.create({
    data: {
      name, email, identifiant, role,
      password: await bcrypt.hash(MOT_DE_PASSE_PAR_DEFAUT, 12),
      doitChangerMotDePasse: true,
    },
    select: SELECT_COMPTE,
  });
  await logAudit(acteur.id, "COMPTE_CREE", "User", compte.id, `${identifiant || email} (${role})`);
  return compte;
}

/**
 * Modification d'un compte : nom, email, identifiant, activation, réinitialisation du mot de passe
 * (super admin : tout compte ; admin : agents uniquement) ; rôle : super admin uniquement.
 */
export async function modifierCompte(
  acteur: Acteur,
  id: string,
  data: { name?: string; email?: string; identifiant?: string; role?: string; actif?: boolean; reinitialiserMotDePasse?: boolean }
) {
  const cible = await prisma.user.findUnique({ where: { id } });
  if (!cible) throw new CompteError("Compte introuvable", 404);
  const soiMeme = cible.id === acteur.id;
  if (!soiMeme && !peutGererCompte(acteur, cible)) {
    throw new CompteError(acteur.role === "ADMIN" ? "Un administrateur ne peut modifier que les agents de saisie" : "Non autorisé", 403);
  }
  if (soiMeme && acteur.role !== "SUPER_ADMIN" && (data.role !== undefined || data.actif !== undefined || data.reinitialiserMotDePasse)) {
    throw new CompteError("Vous ne pouvez pas modifier votre propre rôle ou statut", 403);
  }

  const maj: any = {};
  const details: string[] = [];
  if (data.name !== undefined) {
    const name = String(data.name || "").trim();
    if (!name) throw new CompteError("Le nom est obligatoire");
    maj.name = name;
  }
  if (data.identifiant !== undefined) maj.identifiant = nettoyerIdentifiant(data.identifiant);
  if (data.email !== undefined) maj.email = nettoyerEmail(data.email);
  // Avec un identifiant, l'email est toujours généré : identifiant@spi-cam.cm
  const identifiantRetenu = maj.identifiant !== undefined ? maj.identifiant : cible.identifiant;
  if (identifiantRetenu) {
    const genere = emailDepuisIdentifiant(identifiantRetenu);
    if (genere !== cible.email || maj.email !== undefined) maj.email = genere;
  }
  const identifiantFinal = maj.identifiant !== undefined ? maj.identifiant : cible.identifiant;
  const emailFinal = maj.email !== undefined ? maj.email : cible.email;
  if (!identifiantFinal && !emailFinal) throw new CompteError("Un identifiant ou un email de connexion est obligatoire");
  await verifierUnicite(maj.identifiant ?? null, maj.email ?? null, cible.id);

  if (data.role !== undefined && data.role !== cible.role) {
    if (!estRole(data.role) || !rolesAttribuables(acteur.role).includes(data.role)) {
      throw new CompteError("Seul le super administrateur peut attribuer les rôles", 403);
    }
    if (soiMeme) throw new CompteError("Vous ne pouvez pas modifier votre propre rôle", 403);
    if (cible.role === "SUPER_ADMIN" && (await nombreSuperAdminsActifs(cible.id)) === 0) {
      throw new CompteError("Impossible : il doit rester au moins un super administrateur actif", 409);
    }
    maj.role = data.role;
    details.push(`rôle ${cible.role} -> ${data.role}`);
  }
  if (data.actif !== undefined && data.actif !== cible.actif) {
    if (soiMeme) throw new CompteError("Vous ne pouvez pas désactiver votre propre compte", 403);
    if (!data.actif && cible.role === "SUPER_ADMIN" && (await nombreSuperAdminsActifs(cible.id)) === 0) {
      throw new CompteError("Impossible : il doit rester au moins un super administrateur actif", 409);
    }
    maj.actif = !!data.actif;
    details.push(data.actif ? "réactivé" : "désactivé");
  }
  if (data.reinitialiserMotDePasse) {
    if (soiMeme) throw new CompteError("Utilisez « Mon compte » pour changer votre propre mot de passe", 400);
    maj.password = await bcrypt.hash(MOT_DE_PASSE_PAR_DEFAUT, 12);
    maj.doitChangerMotDePasse = true;
    maj.tentativesEchouees = 0;
    maj.bloqueJusqua = null;
    details.push("mot de passe réinitialisé");
  }

  const compte = await prisma.user.update({ where: { id }, data: maj, select: SELECT_COMPTE });
  await logAudit(acteur.id, "COMPTE_MODIFIE", "User", id, details.join(", ") || "informations");
  return compte;
}

/** Suppression définitive (super admin) ; les saisies passées sont conservées sans auteur. */
export async function supprimerCompte(acteur: Acteur, id: string) {
  if (acteur.role !== "SUPER_ADMIN") throw new CompteError("Seul le super administrateur peut supprimer un compte", 403);
  if (id === acteur.id) throw new CompteError("Vous ne pouvez pas supprimer votre propre compte", 400);
  const cible = await prisma.user.findUnique({ where: { id } });
  if (!cible) throw new CompteError("Compte introuvable", 404);
  if (cible.role === "SUPER_ADMIN" && (await nombreSuperAdminsActifs(cible.id)) === 0) {
    throw new CompteError("Impossible : il doit rester au moins un super administrateur actif", 409);
  }
  await detacherReferences([id]);
  await prisma.user.delete({ where: { id } });
  await logAudit(acteur.id, "COMPTE_SUPPRIME", "User", id, `${cible.identifiant || cible.email} (${cible.role})`);
}

/** Détache les comptes de leurs saisies avant suppression (les données métier sont conservées). */
export async function detacherReferences(ids: string[]) {
  await prisma.$transaction([
    prisma.production.updateMany({ where: { saisiePar: { in: ids } }, data: { saisiePar: null } }),
    prisma.production.updateMany({ where: { validePar: { in: ids } }, data: { validePar: null } }),
    prisma.entreprise.updateMany({ where: { agentId: { in: ids } }, data: { agentId: null } }),
    prisma.auditLog.updateMany({ where: { userId: { in: ids } }, data: { userId: null } }),
  ]);
}
