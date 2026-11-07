import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SELECT_PUBLIC } from "@/lib/public-entreprise";

export const dynamic = "force-dynamic";

// GET /api/public/entreprises/[id] — fiche publique : entreprise active, établissements, produits,
// et uniquement les déclarations VALIDÉES (avec leurs lignes produit).
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const entreprise = await prisma.entreprise.findFirst({
      where: { id: params.id, statut: "ACTIF" },
      select: {
        ...SELECT_PUBLIC,
        produits: { where: { actif: true }, orderBy: { nom: "asc" }, select: { id: true, nom: true, unite: true } },
        etablissements: {
          orderBy: [{ principal: "desc" }, { createdAt: "asc" }],
          select: { id: true, nom: true, principal: true, region: true, ville: true, quartier: true, lieuDit: true, classeEtablissement: true },
        },
      },
    });
    if (!entreprise) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const productions = await prisma.production.findMany({
      where: { entrepriseId: params.id, statut: "VALIDE" },
      orderBy: [{ annee: "desc" }, { trimestre: "desc" }],
      select: {
        id: true, annee: true, trimestre: true, chiffreAffaires: true, effectifs: true,
        lignes: { orderBy: { produit: "asc" }, select: { produit: true, quantite: true, unite: true } },
      },
    });

    return NextResponse.json({ entreprise, productions });
  } catch (error) {
    console.error("Erreur API publique entreprise détail:", error);
    return NextResponse.json({ error: "Erreur de chargement de l'entreprise" }, { status: 500 });
  }
}
