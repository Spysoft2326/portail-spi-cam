import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Pour tester, on retourne la première entreprise
    const entreprise = await prisma.enterprise.findFirst({
      orderBy: { denomination: "asc" },
    });

    if (!entreprise) {
      return NextResponse.json({ error: "Aucune entreprise" }, { status: 404 });
    }

    return NextResponse.json({ entreprise });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
