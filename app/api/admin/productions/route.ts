import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const productions = await prisma.production.findMany({
      include: {
        entreprise: {
          select: {
            denomination: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Comptage par entreprise (pas par agent car saisiePar n'existe pas)
    const entrepriseIds: string[] = [];
    productions.forEach(p => {
      if (!entrepriseIds.includes(p.entrepriseId)) {
        entrepriseIds.push(p.entrepriseId);
      }
    });

    return NextResponse.json({
      productions,
      total: productions.length,
      nombreEntreprises: entrepriseIds.length,
    });
  } catch (error) {
    console.error("Erreur API admin productions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation" },
      { status: 500 }
    );
  }
}
