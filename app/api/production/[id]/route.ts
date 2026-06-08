import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/production/[id] - Détail d'une production
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const production = await prisma.production.findUnique({
      where: { id: params.id },
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            referenceSPI: true,
            secteurActivite: true,
            region: true,
          },
        },
      },
    });

    if (!production) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    if (
      session.user.role === "AGENT_SAISIE" &&
      production.saisiePar !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ production });
  } catch (error) {
    console.error("[PRODUCTION_ID_GET]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// PUT /api/production/[id] - Modifier une production
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existing = await prisma.production.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    // Permissions
    if (
      session.user.role === "AGENT_SAISIE" &&
      existing.saisiePar !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Si déjà validée, seul admin peut modifier
    if (existing.statut === "VALIDEE" && session.user.role === "AGENT_SAISIE") {
      return NextResponse.json(
        { error: "Production validée, modification impossible" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      productionPhysique,
      chiffreAffaires,
      effectifs,
      investissements,
      commentaire,
    } = body;

    const production = await prisma.production.update({
      where: { id: params.id },
      data: {
        productionPhysique: productionPhysique ? parseFloat(productionPhysique) : existing.productionPhysique,
        chiffreAffaires: chiffreAffaires ? parseFloat(chiffreAffaires) : existing.chiffreAffaires,
        effectifs: effectifs ? parseInt(effectifs) : existing.effectifs,
        investissements: investissements ? parseFloat(investissements) : existing.investissements,
        commentaire: commentaire !== undefined ? commentaire : existing.commentaire,
        statut: "EN_ATTENTE", // Repasse en attente si modifiée
        dateValidation: null,
        validePar: null,
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

    return NextResponse.json({ production });
  } catch (error) {
    console.error("[PRODUCTION_ID_PUT]", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

// DELETE /api/production/[id] - Supprimer une production
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existing = await prisma.production.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    // Permissions
    if (
      session.user.role === "AGENT_SAISIE" &&
      existing.saisiePar !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    await prisma.production.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCTION_ID_DELETE]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
