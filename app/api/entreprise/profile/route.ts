import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Données internes : connexion obligatoire
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

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
  }
}
