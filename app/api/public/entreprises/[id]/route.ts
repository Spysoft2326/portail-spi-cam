import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const entreprise = await prisma.entreprise.findUnique({
      where: { id },
    });

    if (!entreprise) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les productions de l'entreprise
    const productions = await prisma.production.findMany({
      where: { entrepriseId: id },
      orderBy: [
        { annee: "desc" },
        { trimestre: "desc" },
      ],
    });

    return NextResponse.json({
      entreprise,
      productions,
    });
  } catch (error) {
    console.error("Erreur API publique entreprise détail:", error);
    return NextResponse.json(
      { error: "Erreur de chargement de l'entreprise" },
      { status: 500 }
    );
  }
}
