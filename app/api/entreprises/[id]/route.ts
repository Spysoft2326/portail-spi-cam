import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/entreprises/[id] — Détails d'une entreprise
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = params;

    const entreprise = await prisma.entreprise.findUnique({
      where: { id },
      include: {
        productions: {
          select: {
            id: true,
            annee: true,
            trimestre: true,
            statut: true,
          },
        },
      },
    });

    if (!entreprise) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ entreprise });
  } catch (error) {
    console.error("[ENTREPRISE_GET_ID]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'entreprise" },
      { status: 500 }
    );
  }
}

// PATCH /api/entreprises/[id] — Modifier statut (Admin/SuperAdmin)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = session.user.role;

    // Seuls Admin et SuperAdmin peuvent valider/rejeter
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Seuls Admin et SuperAdmin peuvent valider" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { statut } = body;

    // Validation du statut
    if (!statut || !["ACTIF", "EN_ATTENTE", "REJETE"].includes(statut)) {
      return NextResponse.json(
        { error: "Statut invalide. Utilisez 'ACTIF', 'EN_ATTENTE' ou 'REJETE'" },
        { status: 400 }
      );
    }

    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    const entreprise = await prisma.entreprise.update({
      where: { id },
      data: { statut },
    });

    return NextResponse.json({ entreprise });
  } catch (error) {
    console.error("[ENTREPRISE_PATCH]", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation de l'entreprise" },
      { status: 500 }
    );
  }
}

// DELETE /api/entreprises/[id] — Supprimer (SuperAdmin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = session.user.role;

    // Seul SuperAdmin peut supprimer
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Seul SuperAdmin peut supprimer" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    await prisma.entreprise.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Entreprise supprimée" });
  } catch (error) {
    console.error("[ENTREPRISE_DELETE]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entreprise" },
      { status: 500 }
    );
  }
}
