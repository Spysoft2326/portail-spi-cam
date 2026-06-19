import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper pour la mise à jour (utilisé par PATCH et PUT)
async function updateProduction(
  request: NextRequest,
  params: { id: string }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();

  const existing = await prisma.production.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Production non trouvee" }, { status: 404 });
  }

  const userRole = session.user.role;
  const userId = session.user.id;

  // Agent ne peut modifier que SES productions EN_ATTENTE
  if (userRole === "AGENT_SAISIE") {
    if (existing.saisiePar !== userId) {
      return NextResponse.json({ error: "Non autorise - ce n'est pas votre production" }, { status: 403 });
    }
    if (existing.statut !== "EN_ATTENTE") {
      return NextResponse.json({ error: "Non autorise - production deja validee" }, { status: 403 });
    }
  }

  // Admin/SuperAdmin peuvent tout modifier
  const updateData: any = {};
  if (body.produit !== undefined) updateData.produit = body.produit;
  if (body.quantite !== undefined) updateData.quantite = parseFloat(body.quantite);
  if (body.unite !== undefined) updateData.unite = body.unite;
  if (body.periode !== undefined) updateData.periode = body.periode;
  if (body.annee !== undefined) updateData.annee = parseInt(body.annee);
  if (body.trimestre !== undefined) updateData.trimestre = parseInt(body.trimestre);
  if (body.productionPhysique !== undefined) updateData.productionPhysique = parseFloat(body.productionPhysique);
  if (body.chiffreAffaires !== undefined) updateData.chiffreAffaires = parseFloat(body.chiffreAffaires);
  if (body.effectifs !== undefined) updateData.effectifs = parseInt(body.effectifs);
  if (body.commentaire !== undefined) updateData.commentaire = body.commentaire;
  // Gestion des champs investissements si présents
  if (body.investissements !== undefined) updateData.investissements = parseFloat(body.investissements);

  const production = await prisma.production.update({
    where: { id },
    data: updateData,
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
}

// PUT /api/production/[id] - Modifier une production (alias de PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await updateProduction(request, params);
  } catch (error) {
    console.error("[PRODUCTION_PUT]", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la production" },
      { status: 500 }
    );
  }
}

// PATCH /api/production/[id] - Modifier une production (Agent/Admin/SuperAdmin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await updateProduction(request, params);
  } catch (error) {
    console.error("[PRODUCTION_PATCH]", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la production" },
      { status: 500 }
    );
  }
}

// GET /api/production/[id] - Details d'une production
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { id } = params;

    const production = await prisma.production.findUnique({
      where: { id },
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            referenceSPI: true,
            secteurActivite: true,
          },
        },
      },
    });

    if (!production) {
      return NextResponse.json({ error: "Production non trouvee" }, { status: 404 });
    }

    return NextResponse.json({ production });
  } catch (error) {
    console.error("[PRODUCTION_GET_ID]", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation de la production" },
      { status: 500 }
    );
  }
}

// DELETE /api/production/[id] - Supprimer une production (Agent/Admin/SuperAdmin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.production.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Production non trouvee" }, { status: 404 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    // Agent ne peut supprimer que SES productions EN_ATTENTE
    if (userRole === "AGENT_SAISIE") {
      if (existing.saisiePar !== userId) {
        return NextResponse.json({ error: "Non autorise" }, { status: 403 });
      }
      if (existing.statut !== "EN_ATTENTE") {
        return NextResponse.json({ error: "Non autorise - production deja validee" }, { status: 403 });
      }
    }

    await prisma.production.delete({ where: { id } });

    return NextResponse.json({ message: "Production supprimee" });
  } catch (error) {
    console.error("[PRODUCTION_DELETE]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la production" },
      { status: 500 }
    );
  }
}
