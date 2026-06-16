import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/production/[id] - Modifier une production (Admin/SuperAdmin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Seuls Admin et SuperAdmin peuvent modifier" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { produit, quantite, unite, periode, annee } = body;

    const existing = await prisma.production.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (produit !== undefined) updateData.produit = produit;
    if (quantite !== undefined) updateData.quantite = quantite;
    if (unite !== undefined) updateData.unite = unite;
    if (periode !== undefined) updateData.periode = periode;
    if (annee !== undefined) updateData.annee = annee;

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
  } catch (error) {
    console.error("[PRODUCTION_PATCH]", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la production" },
      { status: 500 }
    );
  }
}

// GET /api/production/[id] - Détails d'une production
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
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
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ production });
  } catch (error) {
    console.error("[PRODUCTION_GET_ID]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la production" },
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

    const { id } = params;

    const existing = await prisma.production.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Seuls Admin et SuperAdmin peuvent supprimer" },
        { status: 403 }
      );
    }

    await prisma.production.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Production supprimée" });
  } catch (error) {
    console.error("[PRODUCTION_DELETE]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la production" },
      { status: 500 }
    );
  }
}
