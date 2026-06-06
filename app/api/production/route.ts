import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

const productionSchema = z.object({
  entrepriseId: z.string().uuid(),
  annee: z.number().int().min(2020).max(2030),
  periode: z.enum(["TRIMESTRIEL", "SEMESTRIEL", "ANNUEL"]),
  trimestre: z.number().int().min(1).max(4).optional(),
  semestre: z.number().int().min(1).max(2).optional(),
  volumeProduit: z.number().optional(),
  uniteMesure: z.string().optional(),
  valeurProduction: z.number().optional(),
  chiffreAffaires: z.number().optional(),
  nombreEmployes: z.number().int().optional(),
  nombreEmployesTemporaires: z.number().int().optional(),
  capaciteInstallee: z.number().optional(),
  capaciteUtilisee: z.number().min(0).max(100).optional(),
  tauxQualite: z.number().min(0).max(100).optional(),
  tauxDisponibilite: z.number().min(0).max(100).optional(),
  volumeExport: z.number().optional(),
  valeurExport: z.number().optional(),
  paysDestination: z.string().optional(),
  matieresPremieresLocal: z.number().min(0).max(100).optional(),
  matieresPremieresImport: z.number().min(0).max(100).optional(),
  sourceDonnee: z.string().min(1),
  methodeCollecte: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const validated = productionSchema.parse(body);

    const production = await prisma.productionData.create({
      data: {
        ...validated,
        saisieParId: session.user.id || "",
        statutValidation: "EN_ATTENTE",
      },
    });

    return NextResponse.json({ success: true, production });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Erreur création production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get("statut") || undefined;
    const entrepriseId = searchParams.get("entrepriseId") || undefined;
    const agentId = searchParams.get("agentId") || undefined;

    const where: any = {};
    if (statut) where.statutValidation = statut;
    if (entrepriseId) where.entrepriseId = entrepriseId;
    if (agentId) where.saisieParId = agentId;

    // Agent ne voit que ses propres saisies
    if (session.user.role === "AGENT_SAISIE") {
      where.saisieParId = session.user.id;
    }

    const productions = await prisma.productionData.findMany({
      where,
      include: {
        entreprise: {
          select: {
            denomination: true,
            referenceSPI: true,
          },
        },
        saisiePar: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { dateSaisie: "desc" },
    });

    return NextResponse.json({ productions });
  } catch (error: any) {
    console.error("Erreur récupération productions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

