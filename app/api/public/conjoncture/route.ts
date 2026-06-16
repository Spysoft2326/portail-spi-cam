import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const annee = searchParams.get("annee") ? parseInt(searchParams.get("annee")!) : undefined;
    const trimestre = searchParams.get("trimestre") ? parseInt(searchParams.get("trimestre")!) : undefined;
    const secteur = searchParams.get("secteur") || undefined;

    // Construire le where
    const where: any = {};
    if (annee) where.annee = annee;
    if (trimestre) where.trimestre = trimestre;
    if (secteur) {
      where.entreprise = {
        secteurActivite: secteur
      };
    }

    // Récupérer les productions avec les entreprises
    const productions = await prisma.production.findMany({
      where,
      include: {
        entreprise: {
          select: {
            denomination: true,
            secteurActivite: true,
          }
        }
      },
      orderBy: [
        { annee: "desc" },
        { trimestre: "desc" },
      ],
      take: 100, // Limiter à 100 résultats
    });

    // Calculer les stats basiques (sans chiffreAffaires, effectifs, investissements)
    const totalProductions = productions.length;

    // Regrouper par secteur
    const secteurMap = new Map<string, number>();
    productions.forEach(p => {
      const s = p.entreprise?.secteurActivite || "Inconnu";
      secteurMap.set(s, (secteurMap.get(s) || 0) + 1);
    });
    const productionsParSecteur = Array.from(secteurMap.entries()).map(([name, value]) => ({ name, value }));

    // Regrouper par trimestre
    const trimestreMap = new Map<string, number>();
    productions.forEach(p => {
      const key = `${p.annee || "N/A"}T${p.trimestre || "N/A"}`;
      trimestreMap.set(key, (trimestreMap.get(key) || 0) + 1);
    });
    const productionsParTrimestre = Array.from(trimestreMap.entries())
      .map(([name, productions]) => ({ name, productions }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Récupérer les années et secteurs disponibles
    const allProductions = await prisma.production.findMany({
      select: { annee: true },
      distinct: ["annee"],
      orderBy: { annee: "desc" },
    });
    const annees = allProductions.map(p => p.annee).filter((a): a is number => a !== null);

    const allEntreprises = await prisma.entreprise.findMany({
      select: { secteurActivite: true },
      distinct: ["secteurActivite"],
    });
    const secteurs = allEntreprises.map(e => e.secteurActivite).filter(Boolean);

    return NextResponse.json({
      productions,
      stats: {
        totalProductions,
        productionsParSecteur,
        productionsParTrimestre,
      },
      annees,
      secteurs,
    });
  } catch (error) {
    console.error("Erreur API conjoncture:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des données de conjoncture" },
      { status: 500 }
    );
  }
}
