import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const [
      totalUsers,
      totalAgents,
      totalAdmins,
      totalProductions,
      totalEntreprises,
      entreprisesEnAttente,
      entreprisesActives,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "AGENT_SAISIE" } }),
      prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
      prisma.production.count(),
      prisma.entreprise.count(),
      prisma.entreprise.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.entreprise.count({ where: { statut: "ACTIF" } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalAgents,
      totalAdmins,
      totalProductions,
      totalEntreprises,
      entreprisesEnAttente,
      entreprisesActives,
    });
  } catch (error) {
    console.error("Erreur API admin stats:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des statistiques" },
      { status: 500 }
    );
  }
}
