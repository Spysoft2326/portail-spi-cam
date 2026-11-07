/**
 * Politique de droits du portail : « qui peut le plus peut le moins ».
 *
 * Les rôles sont hiérarchisés ; un rôle hérite de tous les droits des rôles inférieurs :
 *   SUPER_ADMIN (3)  >  ADMIN (2)  >  AGENT_SAISIE (1)
 *
 * Gestion des comptes :
 *   - SUPER_ADMIN : crée les comptes, attribue tous les rôles, modifie / désactive / supprime tout compte
 *                   (sauf rétrograder, désactiver ou supprimer son propre compte, et jamais le dernier super admin).
 *   - ADMIN       : modifie les comptes AGENT_SAISIE (nom, email, identifiant, activation, réinitialisation
 *                   du mot de passe). Ne crée pas de compte et n'attribue pas de rôle.
 *   - Tout utilisateur : modifie son propre mot de passe.
 */

export const ROLES = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const NIVEAU: Record<Role, number> = { AGENT_SAISIE: 1, ADMIN: 2, SUPER_ADMIN: 3 };

export const LIBELLE_ROLE: Record<Role, string> = {
  AGENT_SAISIE: "Agent de saisie",
  ADMIN: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

/** Mot de passe attribué à la création et à la réinitialisation ; son changement est imposé à la connexion. */
export const MOT_DE_PASSE_PAR_DEFAUT = "SpiCam2026!";

/** Domaine des adresses professionnelles : l'email d'un compte est « identifiant@spi-cam.cm ». */
export const DOMAINE_EMAIL = "spi-cam.cm";

/** Email généré automatiquement à partir de l'identifiant de connexion (ou null sans identifiant). */
export function emailDepuisIdentifiant(identifiant: string | null | undefined): string | null {
  const id = (identifiant || "").trim().toLowerCase();
  return id ? `${id}@${DOMAINE_EMAIL}` : null;
}

export const estRole = (r: unknown): r is Role => typeof r === "string" && (ROLES as readonly string[]).includes(r);

export function niveau(role: string | null | undefined): number {
  return estRole(role) ? NIVEAU[role] : 0;
}

/** « Qui peut le plus peut le moins » : vrai si `role` atteint au moins le niveau de `minimum`. */
export function aAuMoins(role: string | null | undefined, minimum: Role): boolean {
  return niveau(role) >= NIVEAU[minimum];
}

/** Rôles qu'un acteur peut attribuer (uniquement le super admin). */
export function rolesAttribuables(acteur: string | null | undefined): Role[] {
  return acteur === "SUPER_ADMIN" ? [...ROLES] : [];
}

/** L'acteur peut-il modifier le compte cible (hors mot de passe personnel) ? */
export function peutGererCompte(acteur: { id: string; role?: string | null }, cible: { id: string; role: string }): boolean {
  if (acteur.role === "SUPER_ADMIN") return true;
  if (acteur.role === "ADMIN") return cible.role === "AGENT_SAISIE" && cible.id !== acteur.id;
  return false;
}

/**
 * Règles de robustesse d'un nouveau mot de passe.
 * Renvoie un message d'erreur, ou null si le mot de passe est acceptable.
 */
export function verifierMotDePasse(motDePasse: string): string | null {
  if (typeof motDePasse !== "string" || motDePasse.length < 10) return "Le mot de passe doit contenir au moins 10 caractères";
  if (motDePasse.length > 128) return "Le mot de passe est trop long";
  if (!/[a-z]/.test(motDePasse) || !/[A-Z]/.test(motDePasse)) return "Le mot de passe doit contenir des minuscules et des majuscules";
  if (!/[0-9]/.test(motDePasse)) return "Le mot de passe doit contenir au moins un chiffre";
  if (!/[^A-Za-z0-9]/.test(motDePasse)) return "Le mot de passe doit contenir au moins un caractère spécial";
  if (motDePasse === MOT_DE_PASSE_PAR_DEFAUT) return "Choisissez un mot de passe différent du mot de passe par défaut";
  return null;
}
