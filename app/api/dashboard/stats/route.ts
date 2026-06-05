import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      totalEntreprises,
      parSecteur,
      parRegion,
      parVille,
      parStatut,
      recentes,
      avecProduction,
      avecDocuments,
    ] = await Promise.all([
      prisma.entreprise.count(),
      prisma.entreprise.groupBy({
        by: ["secteurActivite"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.entreprise.groupBy({
        by: ["region"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.entreprise.groupBy({
        by: ["ville"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.entreprise.groupBy({
        by: ["statut"],
        _count: { id: true },
      }),
      prisma.entreprise.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.entreprise.count({ where: { productions: { some: {} } } }),
      prisma.entreprise.count({ where: { documents: { some: {} } } }),
    ]);

    return NextResponse.json({
      totalEntreprises,
      parSecteur: parSecteur.map((s) => ({
        name: s.secteurActivite,
        count: s._count.id,
      })),
      parRegion: parRegion.map((r) => ({
        name: r.region,
        count: r._count.id,
      })),
      parVille: parVille.map((v) => ({
        name: v.ville || "Non spécifié",
        count: v._count.id,
      })),
      parStatut: parStatut.map((s) => ({
        name: s.statut,
        count: s._count.id,
      })),
      recentes,
      avecProduction,
      avecDocuments,
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    return NextResponse.json({ error: "Erreur stats" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
