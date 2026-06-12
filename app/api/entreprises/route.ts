import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// ✅ GET — Liste des entreprises (existant, conservé)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";
    const region = searchParams.get("region") || "";
    const city = searchParams.get("city") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { denomination: { contains: searchLower, mode: 'insensitive' } },
        { sigle: { contains: searchLower, mode: 'insensitive' } },
        { produitsPrincipaux: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    if (sector) where.secteurActivite = sector;
    if (region) where.region = region;
    if (city) where.ville = city;

    const [entreprises, total] = await Promise.all([
      prisma.entreprise.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { denomination: "asc" },
      }),
      prisma.entreprise.count({ where }),
    ]);

    const sectors = await prisma.entreprise.findMany({
      select: { secteurActivite: true },
      distinct: ["secteurActivite"],
    });

    const regions = await prisma.entreprise.findMany({
      select: { region: true },
      distinct: ["region"],
    });

    const cities = await prisma.entreprise.findMany({
      select: { ville: true },
      distinct: ["ville"],
      where: { ville: { not: null } },
    });

    return NextResponse.json({
      entreprises,
      total,
      totalPages: Math.ceil(total / limit),
      filters: {
        sectors: sectors.map((s) => s.secteurActivite).filter(Boolean),
        regions: regions.map((r) => r.region).filter(Boolean),
        cities: cities.map((c) => c.ville).filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Erreur API entreprises GET:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des entreprises" },
      { status: 500 }
    );
  }
}

// ✅ POST — Créer une nouvelle entreprise (NOUVEAU)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    // Validation minimale
    if (!body.denomination || body.denomination.trim() === "") {
      return NextResponse.json(
        { error: "La dénomination est obligatoire" },
        { status: 400 }
      );
    }

    // Génération d'une référence SPI unique
    const referenceSPI = `SPI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const entreprise = await prisma.entreprise.create({
      data: {
        referenceSPI,
        denomination: body.denomination.trim(),
        sigle: body.sigle?.trim() || null,
        secteurActivite: body.secteurActivite || "AUTRE",
        ville: body.ville?.trim() || null,
        region: body.region || "Centre",
        siteWeb: body.siteWeb?.trim() || null,
        produitsPrincipaux: body.produitsPrincipaux?.trim() || null,
        statut: body.statut || "ACTIF",
        // Champs optionnels avec valeurs par défaut
        formeJuridique: null,
        capitalSocial: null,
        adresse: null,
        departement: null,
        telephone: null,
        email: null,
        numContribuable: null,
        sousSecteur: null,
        estExportateur: false,
        estDansZoneIndustrielle: false,
        nomZoneIndustrielle: null,
      },
    });

    return NextResponse.json(entreprise, { status: 201 });
  } catch (error: any) {
    console.error("Erreur création entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entreprise" },
      { status: 500 }
    );
  }
}