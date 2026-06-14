import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET — Liste publique des entreprises (filtrée par statut et recherche)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const secteur = searchParams.get("secteur") || "";
    const statut = searchParams.get("statut") || "ACTIF";

    const where: any = { statut };

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ville: { contains: search, mode: "insensitive" } },
      ];
    }

    if (secteur) {
      where.secteurActivite = { equals: secteur, mode: "insensitive" };
    }

    const entreprises = await prisma.entreprise.findMany({
      where,
    });

    return NextResponse.json(entreprises);
  } catch (error) {
    console.error("❌ Erreur GET entreprises:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entreprises" },
      { status: 500 }
    );
  }
}

// ✅ POST — Créer une nouvelle entreprise (AVEC WORKFLOW)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    if (!userRole) {
      return NextResponse.json({ error: "Rôle non défini" }, { status: 403 });
    }

    const allowedRoles = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    let statut = "EN_ATTENTE";
    if (userRole === "SUPER_ADMIN") {
      statut = "ACTIF";
    }

    const entreprise = await prisma.entreprise.create({
      data: {
        nom: body.nom?.trim(),
        description: body.description?.trim() || null,
        ville: body.ville?.trim() || null,
        secteurActivite: body.secteurActivite || "AUTRE",
        statut: statut,
        telephone: body.telephone?.trim() || null,
        email: body.email?.trim() || null,
        nomContact: body.nomContact?.trim() || null,
        adresse: body.adresse?.trim() || null,
        agentId: userRole === "AGENT_SAISIE" ? userId : null,
      },
    });

    return NextResponse.json(entreprise, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entreprise" },
      { status: 500 }
    );
  }
}
