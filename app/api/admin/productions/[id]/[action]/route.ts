import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/productions/[id]/[action] - Valider ou rejeter une production
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise - Admin uniquement" }, { status: 403 });
    }

    const { id, action } = params;

    // Verifier que la production existe
    const existing = await prisma.production.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Production non trouvee" }, { status: 404 });
    }

    // Action "validate" -> changer le statut
    if (action === "validate") {
      const body = await request.json();
      const { statut } = body;

      if (!statut || !["VALIDE", "REJETE"].includes(statut)) {
        return NextResponse.json({ error: "Statut invalide. Utilisez VALIDE ou REJETE" }, { status: 400 });
      }

      const updated = await prisma.production.update({
        where: { id },
        data: {
          statut,
          validePar: session.user.id,
          dateValidation: new Date(),
        },
      });

      return NextResponse.json({
        message: statut === "VALIDE" ? "Production validee" : "Production rejetee",
        production: updated,
      });
    }

    return NextResponse.json({ error: "Action non reconnue. Utilisez 'validate'" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_VALIDATE]", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation" },
      { status: 500 }
    );
  }
}
