import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { action, commentaire } = body;

    if (!["VALIDE", "REJETE"].includes(action)) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const production = await prisma.productionData.update({
      where: { id: params.id },
      data: {
        statutValidation: action,
        validePar: session.user.id,
        dateValidation: new Date(),
        commentaireValidation: commentaire || null,
      },
    });

    return NextResponse.json({ success: true, production });
  } catch (error: any) {
    console.error("Erreur validation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation" },
      { status: 500 }
    );
  }
}
