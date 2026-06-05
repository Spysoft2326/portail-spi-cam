import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";
    const region = searchParams.get("region") || "";
    const city = searchParams.get("city") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { denomination: { contains: search, mode: "insensitive" } },
        { sigle: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (sector) {
      where.secteurActivite = sector;
    }

    if (region) {
      where.region = region;
    }

    if (city) {
      where.ville = city;
    }

    const [entreprises, total] = await Promise.all([
      prisma.entreprise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { denomination: "asc" },
        select: {
          id: true,
          denomination: true,
          sigle: true,
          secteurActivite: true,
          ville: true,
          region: true,
          siteWeb: true,
          produitsPrincipaux: true,
          statut: true,
        },
      }),
      prisma.entreprise.count({ where }),
    ]);

    // Récupérer les valeurs uniques pour les filtres
    const [sectors, regions, cities] = await Promise.all([
      prisma.entreprise.findMany({
        select: { secteurActivite: true },
        distinct: ["secteurActivite"],
        orderBy: { secteurActivite: "asc" },
      }),
      prisma.entreprise.findMany({
        select: { region: true },
        distinct: ["region"],
        orderBy: { region: "asc" },
      }),
      prisma.entreprise.findMany({
        select: { ville: true },
        distinct: ["ville"],
        orderBy: { ville: "asc" },
      }),
    ]);

    return NextResponse.json({
      entreprises,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        sectors: sectors.map((s) => s.secteurActivite).filter(Boolean),
        regions: regions.map((r) => r.region).filter(Boolean),
        cities: cities.map((c) => c.ville).filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Erreur API entreprises:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entreprises" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
