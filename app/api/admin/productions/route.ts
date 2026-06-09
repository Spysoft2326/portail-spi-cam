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
        agent: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(productions);
  } catch (error) {
    console.error("Erreur API admin productions:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des productions" },
      { status: 500 }
    );
  }
}
