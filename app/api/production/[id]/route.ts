import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-guard";
import {
  declarationSchema,
  declarationInclude,
  resolveLignes,
  assertPeriodeLibre,
  canEditDeclaration,
  logAudit,
  zodMessage,
  DeclarationError,
} from "@/lib/declarations";

const ROLES_SAISIE = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];
type Ctx = { params: { id: string } };

// GET /api/production/[id] — détail d'une déclaration (un agent ne voit que les siennes)
export async function GET(_request: NextRequest, { params }: Ctx) {
  const auth = await requireApiRole(ROLES_SAISIE);
  if (auth.error) return auth.error;
  const user = auth.session.user as { role: string; id: string };

  const production = await prisma.production.findUnique({ where: { id: params.id }, include: declarationInclude });
  if (!production || (user.role === "AGENT_SAISIE" && production.saisiePar !== user.id)) {
    return NextResponse.json({ error: "Déclaration introuvable" }, { status: 404 });
  }
  return NextResponse.json({ production });
}

// PUT /api/production/[id] — modifier une déclaration (lignes remplacées)
// Une déclaration REJETEE corrigée par l'agent repasse EN_ATTENTE.
async function update(request: NextRequest, { params }: Ctx) {
  const auth = await requireApiRole(ROLES_SAISIE);
  if (auth.error) return auth.error;
  const user = auth.session.user as { role: string; id: string };

  try {
    const existing = await prisma.production.findUnique({ where: { id: params.id } });
    if (!existing || (user.role === "AGENT_SAISIE" && existing.saisiePar !== user.id)) {
      return NextResponse.json({ error: "Déclaration introuvable" }, { status: 404 });
    }
    const perm = canEditDeclaration(user.role, user.id, existing);
    if (!perm.ok) return NextResponse.json({ error: perm.reason }, { status: 403 });

    // L'entreprise d'une déclaration ne change pas
    const parsed = declarationSchema.safeParse({ ...(await request.json()), entrepriseId: existing.entrepriseId });
    if (!parsed.success) return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
    const data = parsed.data;

    // Correction d'une déclaration en attente ou rejetée => (re)soumise pour validation
    const resoumise = existing.statut !== "VALIDE";

    const updated = await prisma.$transaction(async (tx) => {
      await assertPeriodeLibre(tx, existing.entrepriseId, data.annee, data.trimestre, existing.id);
      const lignes = await resolveLignes(tx, existing.entrepriseId, data.lignes);
      await tx.ligneProduction.deleteMany({ where: { productionId: existing.id } });
      return tx.production.update({
        where: { id: existing.id },
        data: {
          annee: data.annee,
          trimestre: data.trimestre,
          periode: `T${data.trimestre} ${data.annee}`,
          chiffreAffaires: data.chiffreAffaires ?? null,
          effectifs: data.effectifs ?? null,
          commentaire: data.commentaire || null,
          ...(resoumise ? { statut: "EN_ATTENTE", motifRejet: null, validePar: null, dateValidation: null } : {}),
          lignes: { create: lignes },
        },
        include: declarationInclude,
      });
    });

    await logAudit(
      user.id,
      existing.statut === "REJETE" ? "DECLARATION_RESOUMISE" : existing.statut === "VALIDE" ? "DECLARATION_VALIDEE_MODIFIEE" : "DECLARATION_MODIFIEE",
      "Production",
      existing.id
    );
    return NextResponse.json({ production: updated });
  } catch (error) {
    if (error instanceof DeclarationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PRODUCTION_PUT]", error);
    return NextResponse.json({ error: "Erreur lors de la modification de la déclaration" }, { status: 500 });
  }
}

export const PUT = update;
export const PATCH = update;

// DELETE /api/production/[id] — mêmes droits que la modification
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const auth = await requireApiRole(ROLES_SAISIE);
  if (auth.error) return auth.error;
  const user = auth.session.user as { role: string; id: string };

  try {
    const existing = await prisma.production.findUnique({
      where: { id: params.id },
      include: { entreprise: { select: { denomination: true } } },
    });
    if (!existing || (user.role === "AGENT_SAISIE" && existing.saisiePar !== user.id)) {
      return NextResponse.json({ error: "Déclaration introuvable" }, { status: 404 });
    }
    const perm = canEditDeclaration(user.role, user.id, existing);
    if (!perm.ok) return NextResponse.json({ error: perm.reason }, { status: 403 });

    await prisma.production.delete({ where: { id: existing.id } });
    await logAudit(user.id, "DECLARATION_SUPPRIMEE", "Production", existing.id,
      `${existing.entreprise.denomination} T${existing.trimestre} ${existing.annee} (${existing.statut})`);
    return NextResponse.json({ message: "Déclaration supprimée" });
  } catch (error) {
    console.error("[PRODUCTION_DELETE]", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
