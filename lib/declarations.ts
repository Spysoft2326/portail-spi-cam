import { z } from "zod";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Déclarations trimestrielles multi-produits.
 *
 * Une déclaration (= enregistrement Production) couvre UNE entreprise sur UN trimestre :
 *   - chiffre d'affaires et effectifs totaux de l'entreprise,
 *   - une ou plusieurs lignes produit (nom, quantité, unité).
 *
 * Workflow :
 *   EN_ATTENTE --(admin valide)--> VALIDE
 *   EN_ATTENTE --(admin rejette + motif)--> REJETE --(agent corrige)--> EN_ATTENTE
 */

export const STATUTS_DECLARATION = ["EN_ATTENTE", "VALIDE", "REJETE"] as const;

const ligneSchema = z.object({
  produitId: z.string().optional().nullable(),
  produit: z.string().trim().min(1, "Nom du produit obligatoire").max(120),
  quantite: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
  unite: z.string().trim().min(1, "Unité obligatoire").max(20),
});

export const declarationSchema = z.object({
  entrepriseId: z.string().min(1, "L'entreprise est obligatoire"),
  annee: z.coerce.number().int().min(2000).max(2100),
  // Accepte 1..4 ou "T1".."T4"
  trimestre: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v.replace(/^T/i, ""), 10) : v),
    z.number().int().min(1, "Trimestre invalide").max(4, "Trimestre invalide")
  ),
  chiffreAffaires: z.coerce.number().min(0).optional().nullable(),
  effectifs: z.coerce.number().int().min(0).optional().nullable(),
  commentaire: z.string().trim().max(2000).optional().nullable(),
  lignes: z.array(ligneSchema).min(1, "Ajoutez au moins un produit"),
});

export type DeclarationInput = z.infer<typeof declarationSchema>;

/** Message lisible à partir d'une erreur de validation zod. */
export function zodMessage(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(" ; ");
}

/** Relations renvoyées avec chaque déclaration. */
export const declarationInclude = {
  entreprise: { select: { id: true, denomination: true, sigle: true, secteurActivite: true, referenceSPI: true } },
  agentSaisie: { select: { id: true, name: true, email: true } },
  adminValidation: { select: { id: true, name: true, email: true } },
  lignes: { orderBy: { produit: "asc" as const } },
} satisfies Prisma.ProductionInclude;

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Prépare les lignes : rattache chaque ligne à un produit du catalogue de l'entreprise,
 * en créant le produit s'il n'existe pas encore (une entreprise peut avoir plusieurs produits).
 */
export async function resolveLignes(tx: Tx, entrepriseId: string, lignes: DeclarationInput["lignes"]) {
  const seen = new Set<string>();
  const result: { produitId: string; produit: string; quantite: number; unite: string }[] = [];

  for (const l of lignes) {
    const key = l.produit.toLowerCase();
    if (seen.has(key)) {
      throw new DeclarationError(`Le produit « ${l.produit} » apparaît deux fois dans la déclaration`, 400);
    }
    seen.add(key);

    let produit = l.produitId
      ? await tx.produit.findFirst({ where: { id: l.produitId, entrepriseId } })
      : null;
    if (!produit) {
      produit = await tx.produit.upsert({
        where: { entrepriseId_nom: { entrepriseId, nom: l.produit } },
        update: {},
        create: { entrepriseId, nom: l.produit, unite: l.unite },
      });
    }
    result.push({ produitId: produit.id, produit: produit.nom, quantite: l.quantite, unite: l.unite });
  }
  return result;
}

export class DeclarationError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Vérifie qu'il n'existe pas déjà une déclaration pour cette entreprise et ce trimestre. */
export async function assertPeriodeLibre(
  tx: Tx,
  entrepriseId: string,
  annee: number,
  trimestre: number,
  excludeId?: string
) {
  const existing = await tx.production.findFirst({
    where: { entrepriseId, annee, trimestre, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { id: true, statut: true },
  });
  if (existing) {
    throw new DeclarationError(
      `Une déclaration existe déjà pour cette entreprise en T${trimestre} ${annee} (statut : ${existing.statut}). Modifiez-la plutôt que d'en créer une nouvelle.`,
      409
    );
  }
}

/** Trace une action dans le journal d'audit (ne bloque jamais l'action principale). */
export async function logAudit(
  userId: string | undefined,
  action: string,
  entity: string,
  entityId: string,
  details?: string
) {
  try {
    await prisma.auditLog.create({ data: { userId: userId || null, action, entity, entityId, details } });
  } catch (e) {
    console.error("[AUDIT] échec d'écriture:", e);
  }
}

/**
 * Qui peut modifier / supprimer une déclaration ?
 *  - Agent : uniquement ses propres déclarations EN_ATTENTE ou REJETE.
 *  - Admin : les déclarations EN_ATTENTE ou REJETE.
 *  - Super Admin : toutes, y compris VALIDE (tracé dans l'audit).
 */
export function canEditDeclaration(
  role: string,
  userId: string,
  decl: { statut: string; saisiePar: string | null }
): { ok: true } | { ok: false; reason: string } {
  if (role === "SUPER_ADMIN") return { ok: true };
  if (decl.statut === "VALIDE") {
    return { ok: false, reason: "Déclaration déjà validée : seul un Super Admin peut la modifier" };
  }
  if (role === "ADMIN") return { ok: true };
  if (role === "AGENT_SAISIE") {
    if (decl.saisiePar !== userId) return { ok: false, reason: "Ce n'est pas votre déclaration" };
    return { ok: true };
  }
  return { ok: false, reason: "Non autorisé" };
}

/**
 * Valide ou rejette une déclaration EN_ATTENTE.
 * Un ADMIN ne peut pas valider une déclaration qu'il a lui-même saisie (séparation des tâches).
 */
export async function decideDeclaration(
  user: { id: string; role: string },
  id: string,
  statut: "VALIDE" | "REJETE",
  motif?: string | null
) {
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new DeclarationError("Seuls Admin et Super Admin peuvent valider", 403);
  }
  const existing = await prisma.production.findUnique({ where: { id } });
  if (!existing) throw new DeclarationError("Déclaration introuvable", 404);
  if (existing.statut !== "EN_ATTENTE") {
    throw new DeclarationError(`Cette déclaration est déjà ${existing.statut === "VALIDE" ? "validée" : "rejetée"}`, 409);
  }
  if (user.role === "ADMIN" && existing.saisiePar === user.id) {
    throw new DeclarationError("Vous ne pouvez pas valider votre propre saisie", 403);
  }
  const motifPropre = motif?.trim() || null;
  if (statut === "REJETE" && !motifPropre) {
    throw new DeclarationError("Le motif du rejet est obligatoire", 400);
  }

  const updated = await prisma.production.update({
    where: { id },
    data: {
      statut,
      motifRejet: statut === "REJETE" ? motifPropre : null,
      validePar: user.id,
      dateValidation: new Date(),
    },
    include: declarationInclude,
  });
  await logAudit(user.id, statut === "VALIDE" ? "DECLARATION_VALIDEE" : "DECLARATION_REJETEE", "Production", id, motifPropre || undefined);
  return updated;
}
