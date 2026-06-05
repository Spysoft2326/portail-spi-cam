import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Pour tester, on retourne la première entreprise
    const entreprise = await prisma.entreprise.findFirst({
      orderBy: { denomination: "asc" },
    });

    if (!entreprise) {
      return NextResponse.json({ error: "Aucune entreprise" }, { status: 404 });
    }

    return NextResponse.json({ entreprise });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
