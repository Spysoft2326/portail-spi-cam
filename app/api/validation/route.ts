import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/validation - Valider ou rejeter une production
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Seuls admin et super-admin peuvent valider
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
      return NextResponse.json(
        { error: "Accès refusé - Rôle insuffisant" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productionId, action, commentaireValidation } = body;

    if (!productionId || !action) {
      return NextResponse.json(
        { error: "ID production et action obligatoires" },
        { status: 400 }
      );
    }

    if (!["VALIDEE", "REJETEE"].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide (VALIDEE ou REJETEE)" },
        { status: 400 }
      );
    }

    const production = await prisma.production.update({
      where: { id: productionId },
      data: {
        statut: action,
        validePar: session.user.id,
        dateValidation: new Date(),
        commentaire: commentaireValidation
          ? `${action === "VALIDEE" ? "✅ Validée" : "❌ Rejetée"}: ${commentaireValidation}`
          : undefined,
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
    console.error("[VALIDATION_POST]", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation" },
      { status: 500 }
    );
  }
}
