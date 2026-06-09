import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/entreprises - Liste des entreprises
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const secteur = searchParams.get("secteur");
    const region = searchParams.get("region");

    const where: any = {};

    if (search) {
      where.OR = [
        { denomination: { contains: search, mode: "insensitive" } },
        { referenceSPI: { contains: search, mode: "insensitive" } },
        { sigle: { contains: search, mode: "insensitive" } },
      ];
    }

    if (secteur) where.secteurActivite = secteur;
    if (region) where.region = region;

    const entreprises = await prisma.entreprise.findMany({
      where,
      orderBy: { denomination: "asc" },
      select: {
        id: true,
        referenceSPI: true,
        denomination: true,
        sigle: true,
        secteurActivite: true,
        region: true,
        ville: true,
        statut: true,
        estExportateur: true,
        estDansZoneIndustrielle: true,
      },
    });

    return NextResponse.json({ entreprises });
  } catch (error) {
    console.error("[ENTREPRISES_GET]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// POST /api/entreprises - Créer une entreprise (Agent ou Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const {
      referenceSPI,
      denomination,
      sigle,
      formeJuridique,
      capitalSocial,
      adresse,
      ville,
      departement,
      region,
      telephone,
      email,
      siteWeb,
      numContribuable,
      secteurActivite,
      sousSecteur,
      produitsPrincipaux,
      estExportateur,
      estDansZoneIndustrielle,
      nomZoneIndustrielle,
    } = body;

    // Validation minimale
    if (!referenceSPI || !denomination || !region) {
      return NextResponse.json(
        { error: "Référence SPI, dénomination et région obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si référence existe déjà
    const existing = await prisma.entreprise.findUnique({
      where: { referenceSPI },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Référence SPI déjà utilisée" },
        { status: 409 }
      );
    }

    const entreprise = await prisma.entreprise.create({
      data: {
        referenceSPI,
        denomination,
        sigle,
        formeJuridique,
        capitalSocial: capitalSocial ? parseFloat(capitalSocial) : null,
        adresse,
        ville,
        departement,
        region,
        telephone,
        email,
        siteWeb,
        numContribuable,
        secteurActivite: secteurActivite || "AUTRE",
        sousSecteur,
        produitsPrincipaux,
        estExportateur: estExportateur || false,
        estDansZoneIndustrielle: estDansZoneIndustrielle || false,
        nomZoneIndustrielle,
        statut: "ACTIF",
      },
    });

    return NextResponse.json({ entreprise }, { status: 201 });
  } catch (error) {
    console.error("[ENTREPRISES_POST]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
