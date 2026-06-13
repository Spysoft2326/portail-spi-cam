import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// ✅ GET — Liste des productions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const year = searchParams.get("year") || "";
    const agentId = searchParams.get("agentId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (search) {
      where.entreprise = {
        denomination: { contains: search, mode: 'insensitive' }
      };
    }
    if (status) where.statut = status;
    if (year) where.annee = parseInt(year);
    if (agentId) where.saisiePar = agentId;

    const [productions, total] = await Promise.all([
      prisma.production.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { annee: "desc" },
        include: {
          entreprise: {
            select: { id: true, denomination: true, sigle: true }
          }
        }
      }),
      prisma.production.count({ where })
    ]);

    // Stats
    const allProductions = await prisma.production.findMany({ where });
    const stats = {
      total: allProductions.length,
      enAttente: allProductions.filter(p => p.statut === "EN_ATTENTE").length,
      validees: allProductions.filter(p => p.statut === "VALIDEE").length,
      rejetees: allProductions.filter(p => p.statut === "REJETEE").length,
    };

    return NextResponse.json({
      productions,
      total,
      totalPages: Math.ceil(total / limit),
      stats
    });
  } catch (error) {
    console.error("Erreur API productions GET:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des productions" },
      { status: 500 }
    );
  }
}

// ✅ POST — Créer une production
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.entrepriseId || !body.annee || !body.trimestre) {
      return NextResponse.json(
        { error: "entrepriseId, annee et trimestre sont obligatoires" },
        { status: 400 }
      );
    }

    const production = await prisma.production.create({
      data: {
        entrepriseId: body.entrepriseId,
        annee: parseInt(body.annee),
        trimestre: parseInt(body.trimestre),
        productionPhysique: body.productionPhysique ? parseFloat(body.productionPhysique) : null,
        chiffreAffaires: body.chiffreAffaires ? parseFloat(body.chiffreAffaires) : null,
        effectifs: body.effectifs ? parseInt(body.effectifs) : null,
        investissements: body.investissements ? parseFloat(body.investissements) : null,
        commentaire: body.commentaire || null,
        statut: "EN_ATTENTE",
        saisiePar: session.user.id || session.user.email || "unknown",
      },
    });

    return NextResponse.json(production, { status: 201 });
  } catch (error: any) {
    console.error("Erreur création production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la production" },
      { status: 500 }
    );
  }
}
