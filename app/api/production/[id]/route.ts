import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/production/[id] - Valider/Rejeter une production (Admin/SuperAdmin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est Admin ou SuperAdmin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Seuls Admin et SuperAdmin peuvent valider" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { statut } = body;

    // Validation du statut
    if (!statut || !["VALIDE", "REJETE"].includes(statut)) {
      return NextResponse.json(
        { error: "Statut invalide. Utilisez 'VALIDE' ou 'REJETE'" },
        { status: 400 }
      );
    }

    // Vérifier que la production existe
    const existing = await prisma.production.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la production
    const production = await prisma.production.update({
      where: { id },
      data: {
        statut,
        validePar: session.user.id,
        dateValidation: new Date(),
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
    console.error("[PRODUCTION_PATCH]", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation de la production" },
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

    // Vérifier que la production existe
    const existing = await prisma.production.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les permissions : Admin/SuperAdmin peuvent tout supprimer
    // Agent peut supprimer seulement ses propres productions en attente
    if (session.user.role === "AGENT_SAISIE") {
      if (existing.saisiePar !== session.user.id || existing.statut !== "EN_ATTENTE") {
        return NextResponse.json(
          { error: "Non autorisé - Vous ne pouvez supprimer que vos productions en attente" },
          { status: 403 }
        );
      }
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
