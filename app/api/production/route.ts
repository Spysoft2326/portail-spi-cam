import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/production - Liste des productions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const annee = searchParams.get("annee");
    const entrepriseId = searchParams.get("entrepriseId");

    const where: any = {};

    if (annee) where.annee = parseInt(annee);
    if (entrepriseId) where.entrepriseId = entrepriseId;

    const productions = await prisma.production.findMany({
      where,
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            referenceSPI: true,
          },
        },
      },
      orderBy: [
        { annee: "desc" },
      ],
    });

    return NextResponse.json({ productions });
  } catch (error) {
    console.error("[PRODUCTION_GET]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des productions" },
      { status: 500 }
    );
  }
}

// POST /api/production - Créer une production
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const {
      entrepriseId,
      produit,
      quantite,
      unite,
      periode,
      annee,
    } = body;

    // Validation
    if (!entrepriseId || !produit || !annee) {
      return NextResponse.json(
        { error: "Entreprise, produit et année obligatoires" },
        { status: 400 }
      );
    }

    const production = await prisma.production.create({
      data: {
        entrepriseId,
        produit: produit.trim(),
        quantite: quantite ? parseFloat(quantite) : null,
        unite: unite?.trim() || null,
        periode: periode?.trim() || null,
        annee: parseInt(annee),
      },
      include: {
        entreprise: {
          select: {
            id: true,
            denomination: true,
            referenceSPI: true,
          },
        },
      },
    });

    return NextResponse.json({ production }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTION_POST]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la production" },
      { status: 500 }
    );
  }
}
