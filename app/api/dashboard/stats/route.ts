import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Vérification sécurisée du rôle
  const userRole = session?.user?.role;
  if (!userRole || !["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const [
      totalEntreprises,
      avecProduction,
      parSecteur,
    ] = await Promise.all([
      prisma.entreprise.count(),
      prisma.entreprise.findMany({
        where: {
          productions: { some: {} },
        },
      }).then((e: any[]) => e.length),
      prisma.entreprise.groupBy({
        by: ["secteurActivite"],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      totalEntreprises,
      avecProduction,
      parSecteur,
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}