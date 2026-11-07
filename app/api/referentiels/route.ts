import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SECTIONS_INDUSTRIELLES } from "@/lib/nomenclature";

export const dynamic = "force-dynamic";

// GET /api/referentiels — données de référence publiques (pas de donnée d'entreprise) :
//   filières, sections et classes d'activité (CITI Rév.4) avec la filière déduite de chaque classe.
export async function GET() {
  try {
    const [filieres, regles, sections, classes] = await Promise.all([
      prisma.filiere.findMany({ orderBy: { ordre: "asc" } }),
      prisma.filiereRegle.findMany(),
      prisma.activite.findMany({ where: { niveau: "SECTION" }, orderBy: { code: "asc" }, select: { code: true, libelle: true } }),
      prisma.activite.findMany({ where: { niveau: "CLASSE" }, orderBy: { code: "asc" }, select: { code: true, libelle: true, section: true, codeNacam: true } }),
    ]);
    const filiereDe = (code: string) => {
      let best: { prefixe: string; filiereCode: string } | null = null;
      for (const r of regles) if (code.startsWith(r.prefixe) && (!best || r.prefixe.length > best.prefixe.length)) best = r;
      return best?.filiereCode ?? null;
    };
    return NextResponse.json({
      filieres,
      sections: sections.map((s) => ({ ...s, industrielle: SECTIONS_INDUSTRIELLES.includes(s.code) })),
      activites: classes.map((c) => ({ ...c, filiereCode: filiereDe(c.code), industrielle: SECTIONS_INDUSTRIELLES.includes(c.section) })),
    });
  } catch (error) {
    console.error("Erreur GET referentiels:", error);
    return NextResponse.json({ error: "Erreur de chargement des référentiels" }, { status: 500 });
  }
}
