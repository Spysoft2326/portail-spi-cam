import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET — Liste des productions
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const entrepriseId = searchParams.get("entrepriseId");
    const annee = searchParams.get("annee");
    const trimestre = searchParams.get("trimestre");

    const userRole = session?.user?.role;

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

    const productions = await prisma.production.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            sigle: true,
          },
        },
      },
    });

    return NextResponse.json(productions);
  } catch (error) {
    console.error("❌ Erreur GET productions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des productions" },
      { status: 500 }
    );
  }
}

// ✅ POST — Créer une production (Agent/Admin/SuperAdmin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = session.user.role;

    if (!userRole) {
      return NextResponse.json({ error: "Rôle non défini" }, { status: 403 });
    }

    const allowedRoles = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    const production = await prisma.production.create({
      data: {
        entrepriseId: body.entrepriseId,
        produit: body.produit?.trim(),
        quantite: body.quantite ? parseFloat(body.quantite) : null,
        unite: body.unite?.trim() || null,
        periode: body.periode?.trim() || null,
        annee: body.annee ? parseInt(body.annee) : null,
        trimestre: body.trimestre ? parseInt(body.trimestre) : null,
        productionPhysique: body.productionPhysique ? parseFloat(body.productionPhysique) : null,
      },
    });

    return NextResponse.json(production, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la production" },
      { status: 500 }
    );
  }
}
