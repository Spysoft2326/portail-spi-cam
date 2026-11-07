import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  const userRole = session?.user?.role;
  if (!userRole || !["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  try {
    const [
      totalEntreprises,
      avecProduction,
      parSecteur,
      parRegion,
      parVille,
      parStatut,
      recentes,
      avecDocuments,
    ] = await Promise.all([
      prisma.entreprise.count(),
      prisma.entreprise.count({ where: { productions: { some: {} } } }),
      // Répartition par filière (déduite de l'activité codée)
      Promise.all([
        prisma.entreprise.groupBy({ by: ["filiereCode"], _count: { id: true } }),
        prisma.filiere.findMany({ select: { code: true, libelle: true } }),
      ]).then(([data, filieres]) => {
        const lib = new Map(filieres.map((f) => [f.code, f.libelle]));
        return data
          .map((item) => ({ name: item.filiereCode ? lib.get(item.filiereCode) || item.filiereCode : "Hors filière / non codée", count: item._count.id }))
          .sort((a, b) => b.count - a.count);
      }),
      prisma.entreprise.groupBy({
        by: ["region"],
        _count: { id: true },
      }).then((data: any[]) => data.map((item: any) => ({
        name: item.region,
        count: item._count.id,
      }))),
      prisma.entreprise.groupBy({
        by: ["ville"],
        _count: { id: true },
      }).then((data: any[]) => data.map((item: any) => ({
        name: item.ville || "Non specifie",
        count: item._count.id,
      }))),
      prisma.entreprise.groupBy({
        by: ["statut"],
        _count: { id: true },
      }).then((data: any[]) => data.map((item: any) => ({
        name: item.statut,
        count: item._count.id,
      }))),
      prisma.entreprise.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.entreprise.count({
        where: {
          OR: [
            { productions: { some: {} } },
          ],
        },
      }),
    ]);

    const [champIndustriel, nonCodees] = await Promise.all([
      prisma.entreprise.count({ where: { champIndustriel: true, activiteCode: { not: null } } }),
      prisma.entreprise.count({ where: { activiteCode: null } }),
    ]);

    return NextResponse.json({
      totalEntreprises,
      champIndustriel,
      nonCodees,
      avecProduction,
      parSecteur,
      parRegion,
      parVille,
      parStatut,
      recentes,
      avecDocuments,
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des statistiques" },
      { status: 500 }
    );
  }
}