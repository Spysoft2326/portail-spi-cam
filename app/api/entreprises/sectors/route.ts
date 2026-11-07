import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/entreprises/sectors — nombre d'entreprises actives par filière (page d'accueil)
// Réponse : { filieres: [{ code, libelle, prioritaire, count }], horsFiliere }
export async function GET() {
  try {
    const [filieres, groupes] = await Promise.all([
      prisma.filiere.findMany({ orderBy: { ordre: "asc" } }),
      prisma.entreprise.groupBy({ by: ["filiereCode"], where: { statut: "ACTIF" }, _count: { _all: true } }),
    ]);
    const parCode = new Map(groupes.map((g) => [g.filiereCode, g._count._all]));
    return NextResponse.json({
      filieres: filieres.map((f) => ({ code: f.code, libelle: f.libelle, prioritaire: f.prioritaire, count: parCode.get(f.code) || 0 })),
      horsFiliere: parCode.get(null) || 0,
    });
  } catch (error) {
    console.error("Erreur compte par filière:", error);
    return NextResponse.json({ filieres: [], horsFiliere: 0 }, { status: 500 });
  }
}
