import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/production - Liste des productions (filtrées par rôle)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get("statut");
    const annee = searchParams.get("annee");
    const entrepriseId = searchParams.get("entrepriseId");

    const where: any = {};

    // Filtre par rôle : Agent ne voit que ses productions
    if (session.user.role === "AGENT_SAISIE") {
      where.saisiePar = session.user.id;
    }

    if (statut) where.statut = statut;
    if (annee) where.annee = parseInt(annee);
    if (entrepriseId) where.entrepriseId = entrepriseId;

    const productions = await prisma.production.findMany({
      where,
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            referenceSPI: true,
          },
        },
      },
      orderBy: [
        { annee: "desc" },
        { trimestre: "desc" },
      ],
    });

    return NextResponse.json({ productions });
  } catch (error) {
    console.error("[PRODUCTION_GET]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des productions" },
      { status: 500 }
    );
  }
}

// POST /api/production - Créer une production
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const {
      entrepriseId,
      annee,
      trimestre,
      productionPhysique,
      chiffreAffaires,
      effectifs,
      investissements,
      commentaire,
    } = body;

    // Validation
    if (!entrepriseId || !annee || !trimestre) {
      return NextResponse.json(
        { error: "Entreprise, année et trimestre obligatoires" },
        { status: 400 }
      );
    }

    // ✅ CORRECTION : Convertir trimestre string ("T1") → int (1)
    let trimestreNum: number;
    if (typeof trimestre === "string" && trimestre.startsWith("T")) {
      trimestreNum = parseInt(trimestre.replace("T", ""));
    } else {
      trimestreNum = parseInt(trimestre);
    }

    if (isNaN(trimestreNum) || trimestreNum < 1 || trimestreNum > 4) {
      return NextResponse.json(
        { error: "Trimestre invalide. Utilisez T1, T2, T3 ou T4" },
        { status: 400 }
      );
    }

    // Vérifier si production existe déjà
    const existing = await prisma.production.findUnique({
      where: {
        entrepriseId_annee_trimestre: {
          entrepriseId,
          annee: parseInt(annee),
          trimestre: trimestreNum,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Production déjà saisie pour cette période" },
        { status: 409 }
      );
    }

    const production = await prisma.production.create({
      data: {
        entrepriseId,
        annee: parseInt(annee),
        trimestre: trimestreNum,
        productionPhysique: productionPhysique ? parseFloat(productionPhysique) : null,
        chiffreAffaires: chiffreAffaires ? parseFloat(chiffreAffaires) : null,
        effectifs: effectifs ? parseInt(effectifs) : null,
        investissements: investissements ? parseFloat(investissements) : null,
        commentaire,
        saisiePar: session.user.id,
        statut: "EN_ATTENTE",
      },
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            referenceSPI: true,
          },
        },
      },
    });

    return NextResponse.json({ production }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTION_POST]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la production" },
      { status: 500 }
    );
  }
}
