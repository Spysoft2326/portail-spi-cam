import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-guard";
import {
  declarationSchema,
  declarationInclude,
  resolveLignes,
  assertPeriodeLibre,
  logAudit,
  zodMessage,
  DeclarationError,
  STATUTS_DECLARATION,
} from "@/lib/declarations";

const ROLES_SAISIE = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];

// GET /api/productions — liste des déclarations
//   Agent : uniquement ses propres déclarations (imposé côté serveur)
//   Admin / Super Admin : toutes
//   Filtres : entrepriseId, annee, trimestre, statut
export async function GET(request: Request) {
  const auth = await requireApiRole(ROLES_SAISIE);
  if (auth.error) return auth.error;
  const { role, id: userId } = auth.session.user as { role: string; id: string };

  try {
    const { searchParams } = new URL(request.url);
    const where: any = {};
    const entrepriseId = searchParams.get("entrepriseId");
    const annee = searchParams.get("annee");
    const trimestre = searchParams.get("trimestre");
    const statut = searchParams.get("statut");

    if (entrepriseId) where.entrepriseId = entrepriseId;
    if (annee) where.annee = parseInt(annee, 10);
    if (trimestre) where.trimestre = parseInt(trimestre.replace(/^T/i, ""), 10);
    if (statut && (STATUTS_DECLARATION as readonly string[]).includes(statut)) where.statut = statut;
    if (role === "AGENT_SAISIE") where.saisiePar = userId;

    const productions = await prisma.production.findMany({
      where,
      orderBy: [{ annee: "desc" }, { trimestre: "desc" }, { createdAt: "desc" }],
      include: declarationInclude,
    });
    return NextResponse.json(productions);
  } catch (error) {
    console.error("Erreur GET productions:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des déclarations" }, { status: 500 });
  }
}

// POST /api/productions — nouvelle déclaration trimestrielle (statut EN_ATTENTE)
export async function POST(request: Request) {
  const auth = await requireApiRole(ROLES_SAISIE);
  if (auth.error) return auth.error;
  const user = auth.session.user as { role: string; id: string };

  try {
    const parsed = declarationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const entreprise = await prisma.entreprise.findUnique({ where: { id: data.entrepriseId } });
    if (!entreprise) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    if (entreprise.statut !== "ACTIF") {
      return NextResponse.json(
        { error: "Cette entreprise n'est pas encore validée : impossible de déclarer sa production" },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      await assertPeriodeLibre(tx, data.entrepriseId, data.annee, data.trimestre);
      const lignes = await resolveLignes(tx, data.entrepriseId, data.lignes);
      return tx.production.create({
        data: {
          entrepriseId: data.entrepriseId,
          annee: data.annee,
          trimestre: data.trimestre,
          periode: `T${data.trimestre} ${data.annee}`,
          chiffreAffaires: data.chiffreAffaires ?? null,
          effectifs: data.effectifs ?? null,
          commentaire: data.commentaire || null,
          statut: "EN_ATTENTE",
          saisiePar: user.id,
          lignes: { create: lignes },
        },
        include: declarationInclude,
      });
    });

    await logAudit(user.id, "DECLARATION_CREEE", "Production", created.id, `${entreprise.denomination} T${data.trimestre} ${data.annee}`);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof DeclarationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Erreur POST production:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la déclaration" }, { status: 500 });
  }
}
