import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET — Liste des entreprises (filtrée par rôle, recherche, secteur, région, ville)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const secteur = searchParams.get("secteur") || "";
    const region = searchParams.get("region") || "";
    const ville = searchParams.get("ville") || "";
    const statutParam = searchParams.get("statut");

    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    // Déterminer le statut selon le rôle
    let statutFilter = "ACTIF";
    if (!userRole) {
      // Public : voir uniquement ACTIF
      statutFilter = "ACTIF";
    } else if (userRole === "AGENT_SAISIE") {
      statutFilter = statutParam || "ACTIF";
    } else if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      statutFilter = statutParam || "ALL";
    }

    const where: any = {};

    if (statutFilter !== "ALL") {
      where.statut = statutFilter;
    }

    // Agent ne voit que ses propres EN_ATTENTE + toutes les ACTIF
    if (userRole === "AGENT_SAISIE" && statutFilter === "EN_ATTENTE") {
      where.agentId = userId;
    }

    // Recherche textuelle (nom, sigle, ville, contact, téléphone, email)
    if (search) {
      where.OR = [
        { denomination: { contains: search, mode: "insensitive" } },
        { sigle: { contains: search, mode: "insensitive" } },
        { ville: { contains: search, mode: "insensitive" } },
        { nomContact: { contains: search, mode: "insensitive" } },
        { telephone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { adresse: { contains: search, mode: "insensitive" } },
      ];
    }

    if (secteur) {
      where.secteurActivite = { equals: secteur, mode: "insensitive" };
    }

    if (region) {
      where.region = { equals: region, mode: "insensitive" };
    }

    if (ville) {
      where.ville = { equals: ville, mode: "insensitive" };
    }

    const entreprises = await prisma.entreprise.findMany({
      where,
      orderBy: { denomination: "asc" },
      include: {
        _count: {
          select: { productions: true },
        },
      },
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

// ✅ POST — Créer une entreprise (Agent/Admin/SuperAdmin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = session.user.role;

    // ✅ FIX: Vérifier que userRole est défini
    if (!userRole) {
      return NextResponse.json({ error: "Rôle non défini" }, { status: 403 });
    }

    const allowedRoles = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    // Déterminer le statut selon le rôle
    let statut = "EN_ATTENTE";
    if (userRole === "SUPER_ADMIN") {
      statut = "ACTIF";
    }

    const entreprise = await prisma.entreprise.create({
      data: {
        referenceSPI: body.referenceSPI?.trim() || `SPI-${Date.now()}`,
        denomination: body.denomination?.trim(),
        sigle: body.sigle?.trim() || null,
        // ❌ REMOVED: description n'existe pas dans le modèle Prisma
        formeJuridique: body.formeJuridique?.trim() || null,
        capitalSocial: body.capitalSocial ? parseFloat(body.capitalSocial) : null,
        adresse: body.adresse?.trim() || null,
        ville: body.ville?.trim() || null,
        departement: body.departement?.trim() || null,
        region: body.region?.trim() || "Inconnu",
        telephone: body.telephone?.trim() || null,
        email: body.email?.trim() || null,
        nomContact: body.nomContact?.trim() || null,
        siteWeb: body.siteWeb?.trim() || null,
        numContribuable: body.numContribuable?.trim() || null,
        secteurActivite: body.secteurActivite || "AUTRE",
        sousSecteur: body.sousSecteur?.trim() || null,
        produitsPrincipaux: body.produitsPrincipaux?.trim() || null,
        statut: statut,
        estExportateur: body.estExportateur || false,
        estDansZoneIndustrielle: body.estDansZoneIndustrielle || false,
        nomZoneIndustrielle: body.nomZoneIndustrielle?.trim() || null,
        agentId: userRole === "AGENT_SAISIE" ? session.user.id : null,
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
