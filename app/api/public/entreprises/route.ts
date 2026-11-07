import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SELECT_PUBLIC } from "@/lib/public-entreprise";

export const dynamic = "force-dynamic";


// GET /api/public/entreprises — annuaire public paginé (fiches validées uniquement)
//   ?search, ?filiere=CODE, ?activite=préfixe CITI, ?champ=industriel, ?region, ?city, ?page, ?limit (max 100)
//   ?sector=libellé reste accepté (ancien paramètre) et correspond au libellé de filière.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));

    const where: any = { statut: "ACTIF" };
    if (search) {
      where.OR = [
        { denomination: { contains: search, mode: "insensitive" } },
        { sigle: { contains: search, mode: "insensitive" } },
        { produitsPrincipaux: { contains: search, mode: "insensitive" } },
      ];
    }
    const filiere = searchParams.get("filiere");
    const sector = searchParams.get("sector");
    const activite = searchParams.get("activite");
    if (filiere) where.filiereCode = filiere;
    else if (sector) where.secteurActivite = sector;
    if (activite) where.activiteCode = { startsWith: activite };
    if (searchParams.get("champ") === "industriel") where.champIndustriel = true;
    if (searchParams.get("region")) where.region = searchParams.get("region");
    if (searchParams.get("city")) where.ville = searchParams.get("city");

    const [entreprises, total, filieres, regions, cities] = await Promise.all([
      prisma.entreprise.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { denomination: "asc" }, select: SELECT_PUBLIC }),
      prisma.entreprise.count({ where }),
      prisma.filiere.findMany({ orderBy: { ordre: "asc" }, select: { code: true, libelle: true, prioritaire: true } }),
      prisma.entreprise.findMany({ where: { statut: "ACTIF" }, select: { region: true }, distinct: ["region"] }),
      prisma.entreprise.findMany({ where: { statut: "ACTIF", ville: { not: null } }, select: { ville: true }, distinct: ["ville"] }),
    ]);

    return NextResponse.json({
      entreprises,
      total,
      totalPages: Math.ceil(total / limit),
      filters: {
        filieres,
        sectors: filieres.map((f) => f.libelle), // compatibilité avec l'ancien format
        regions: regions.map((r) => r.region).filter(Boolean),
        cities: cities.map((c) => c.ville).filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Erreur API publique entreprises:", error);
    return NextResponse.json({ error: "Erreur de chargement des entreprises" }, { status: 500 });
  }
}
