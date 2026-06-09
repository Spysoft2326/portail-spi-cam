import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// GET /api/entreprises/detail?id=...
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const entreprise = await prisma.entreprise.findUnique({
      where: { id },
      include: {
        productions: {
          orderBy: { annee: "desc" },
        },
      },
    });

    if (!entreprise) {
      return NextResponse.json({ error: "Entreprise non trouvee" }, { status: 404 });
    }

    return NextResponse.json({
      entreprise: {
        id: entreprise.id,
        referenceSPI: entreprise.referenceSPI,
        denomination: entreprise.denomination,
        sigle: entreprise.sigle,
        formeJuridique: entreprise.formeJuridique,
        capitalSocial: entreprise.capitalSocial,
        adresse: entreprise.adresse,
        ville: entreprise.ville,
        departement: entreprise.departement,
        region: entreprise.region,
        telephone: entreprise.telephone,
        email: entreprise.email,
        siteWeb: entreprise.siteWeb,
        numContribuable: entreprise.numContribuable,
        secteurActivite: entreprise.secteurActivite,
        sousSecteur: entreprise.sousSecteur,
        produitsPrincipaux: entreprise.produitsPrincipaux,
        statut: entreprise.statut,
        estExportateur: entreprise.estExportateur,
        estDansZoneIndustrielle: entreprise.estDansZoneIndustrielle,
        nomZoneIndustrielle: entreprise.nomZoneIndustrielle,
        createdAt: entreprise.createdAt.toISOString(),
        updatedAt: entreprise.updatedAt.toISOString(),
      },
      productions: entreprise.productions.map((p) => ({
        id: p.id,
        annee: p.annee,
        trimestre: p.trimestre,
        productionPhysique: p.productionPhysique,
        chiffreAffaires: p.chiffreAffaires,
        effectifs: p.effectifs,
        investissements: p.investissements,
        statut: p.statut,
      })),
    });
  } catch (error) {
    console.error("[ENTREPRISE_DETAIL]", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation" },
      { status: 500 }
    );
  }
}
