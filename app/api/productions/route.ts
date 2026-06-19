import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET — Liste des productions (filtrée par rôle)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const entrepriseId = searchParams.get("entrepriseId");
    const annee = searchParams.get("annee");
    const trimestre = searchParams.get("trimestre");
    const mesProductions = searchParams.get("mesProductions");

    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    const where: any = {};

    if (entrepriseId) {
      where.entrepriseId = entrepriseId;
    }

    if (annee) {
      where.annee = parseInt(annee);
    }

    if (trimestre) {
      where.trimestre = parseInt(trimestre);
    }

    // ✅ Agent ne voit que ses propres productions
    if (userRole === "AGENT_SAISIE" && mesProductions === "true" && userId) {
      where.saisiePar = userId;
    }

    const productions = await prisma.production.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            sigle: true,
            secteurActivite: true,
          },
        },
        agentSaisie: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(productions);
  } catch (error) {
    console.error("Erreur GET productions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des productions" },
      { status: 500 }
    );
  }
}

// ✅ POST — Créer une production (Agent/Admin/SuperAdmin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    if (!userRole) {
      return NextResponse.json({ error: "Role non defini" }, { status: 403 });
    }

    const allowedRoles = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json();

    // ✅ Validation des champs obligatoires
    if (!body.entrepriseId) {
      return NextResponse.json(
        { error: "L'entreprise est obligatoire" },
        { status: 400 }
      );
    }

    // ✅ Convertir trimestre "T1" → 1
    let trimestreNum: number | null = null;
    if (body.trimestre) {
      const trimMap: Record<string, number> = { "T1": 1, "T2": 2, "T3": 3, "T4": 4 };
      trimestreNum = trimMap[body.trimestre] || parseInt(body.trimestre) || null;
    }

    const production = await prisma.production.create({
      data: {
        entrepriseId: body.entrepriseId,
        produit: body.produit?.trim() || null,
        quantite: body.quantite ? parseFloat(body.quantite) : null,
        unite: body.unite?.trim() || null,
        periode: body.periode?.trim() || null,
        annee: body.annee ? parseInt(body.annee) : null,
        trimestre: trimestreNum,
        productionPhysique: body.productionPhysique ? parseFloat(body.productionPhysique) : null,
        // ✅ Nouveaux champs
        chiffreAffaires: body.chiffreAffaires ? parseFloat(body.chiffreAffaires) : null,
        effectifs: body.effectifs ? parseInt(body.effectifs) : null,
        commentaire: body.commentaire?.trim() || null,
        statut: "EN_ATTENTE",
        saisiePar: userId,
      },
    });

    return NextResponse.json(production, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation de la production" },
      { status: 500 }
    );
  }
}
