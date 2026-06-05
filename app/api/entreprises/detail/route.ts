import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const entreprise = await prisma.entreprise.findUnique({
      where: { id },
      include: {
        productions: {
          orderBy: { annee: "desc" },
          take: 5,
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
          take: 10,
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
    console.error("Erreur API détail entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'entreprise" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
