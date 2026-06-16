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
    const userRole = session.user.role;
    if (!userRole || !["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
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

    // Vérifier que la production existe
    const existingProduction = await prisma.production.findUnique({
      where: { id: productionId },
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

    if (!existingProduction) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    // ✅ Production n'a pas de champ statut, validePar, dateValidation, commentaire
    // On crée un audit log pour tracer la validation
    await prisma.auditLog.create({
      data: {
        action: `VALIDATION_${action}`,
        entity: "Production",
        entityId: productionId,
        details: commentaireValidation
          ? `${action === "VALIDEE" ? "✅ Validée" : "❌ Rejetée"}: ${commentaireValidation}`
          : `Production ${action === "VALIDEE" ? "validée" : "rejetée"} par ${session.user.email || session.user.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Production ${action === "VALIDEE" ? "validée" : "rejetée"} avec succès`,
      production: existingProduction,
    });
  } catch (error) {
    console.error("[VALIDATION_POST]", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation" },
      { status: 500 }
    );
  }
}
