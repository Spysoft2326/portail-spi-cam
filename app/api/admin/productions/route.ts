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

    const productions = await prisma.production.findMany({
      include: {
        entreprise: {
          select: { denomination: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Récupérer les noms des agents séparément
    const agentIds = [...new Set(productions.map(p => p.saisiePar))];
    const agents = await prisma.user.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true },
    });

    const agentMap = new Map(agents.map(a => [a.id, a.name]));

    const productionsWithAgent = productions.map(p => ({
      ...p,
      agent: { name: agentMap.get(p.saisiePar) || null },
    }));

    return NextResponse.json(productionsWithAgent);
  } catch (error) {
    console.error("Erreur API admin productions:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des productions" },
      { status: 500 }
    );
  }
}
