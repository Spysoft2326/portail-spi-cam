import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

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
        { denomination: { contains: searchLower } },
        { sigle: { contains: searchLower } },
        { produitsPrincipaux: { contains: searchLower } },
      ];
    }

    if (sector) where.secteurActivite = sector;
    if (region) where.region = region;
    if (city) where.ville = city;

    const [entreprises, total] = await Promise.all([
      prisma.Entreprise.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { denomination: "asc" },
      }),
      prisma.Entreprise.count({ where }),
    ]);

    const sectors = await prisma.Entreprise.findMany({
      select: { secteurActivite: true },
      distinct: ["secteurActivite"],
    });

    const regions = await prisma.Entreprise.findMany({
      select: { region: true },
      distinct: ["region"],
    });

    const cities = await prisma.Entreprise.findMany({
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
    console.error("Erreur API publique entreprises:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des entreprises" },
      { status: 500 }
    );
  }
}
