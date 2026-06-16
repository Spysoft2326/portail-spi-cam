import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entreprises = await prisma.entreprise.findMany({
      select: { secteurActivite: true }
    });

    const sectorsCount: Record<string, number> = {};

    for (const e of entreprises) {
      const secteur = (e.secteurActivite || "AUTRE").trim();
      sectorsCount[secteur] = (sectorsCount[secteur] || 0) + 1;
    }

    return NextResponse.json(sectorsCount);
  } catch (error) {
    console.error("Erreur compte par secteur:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
