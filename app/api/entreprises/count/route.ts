import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/entreprises/count — chiffres publics de la page d'accueil (fiches validées uniquement)
//   count : entreprises actives ; industrielles : dans le champ industriel ; regions : régions couvertes ;
//   emplois : somme des effectifs de la dernière déclaration VALIDÉE de chaque entreprise.
export async function GET() {
  try {
    const [count, industrielles, regions, declarations] = await Promise.all([
      prisma.entreprise.count({ where: { statut: "ACTIF" } }),
      prisma.entreprise.count({ where: { statut: "ACTIF", champIndustriel: true } }),
      prisma.entreprise.findMany({ where: { statut: "ACTIF", NOT: { region: "Inconnu" } }, select: { region: true }, distinct: ["region"] }),
      prisma.production.findMany({
        where: { statut: "VALIDE", effectifs: { not: null }, entreprise: { statut: "ACTIF" } },
        select: { entrepriseId: true, effectifs: true, annee: true, trimestre: true },
        orderBy: [{ annee: "desc" }, { trimestre: "desc" }],
      }),
    ]);
    const vus = new Set<string>();
    let emplois = 0;
    for (const d of declarations) {
      if (vus.has(d.entrepriseId)) continue;
      vus.add(d.entrepriseId);
      emplois += d.effectifs || 0;
    }
    return NextResponse.json({ count, industrielles, regions: regions.length, emplois });
  } catch (error) {
    console.error("Erreur compte entreprises:", error);
    return NextResponse.json({ count: 0, industrielles: 0, regions: 0, emplois: 0 }, { status: 500 });
  }
}
