import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET — Détails d'une entreprise
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: params.id },
      include: {
        productions: true,
        _count: {
          select: { productions: true },
        },
      },
    });

    if (!entreprise) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(entreprise);
  } catch (error) {
    console.error("❌ Erreur GET entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// ✅ PUT — Modifier une entreprise (Agent = ses propres EN_ATTENTE, Admin/SuperAdmin = tout)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    // === VÉRIFICATION DES DROITS ===
    if (userRole === "AGENT_SAISIE") {
      // Agent : peut modifier uniquement SES propres entreprises EN_ATTENTE
      if (existing.agentId !== userId) {
        return NextResponse.json(
          { error: "Vous ne pouvez modifier que vos propres entreprises" },
          { status: 403 }
        );
      }
      if (existing.statut !== "EN_ATTENTE") {
        return NextResponse.json(
          { error: "Vous ne pouvez modifier que les entreprises en attente" },
          { status: 403 }
        );
      }
    }
    // Admin et SuperAdmin peuvent modifier TOUTES les entreprises

    const body = await request.json();

    const updated = await prisma.entreprise.update({
      where: { id: params.id },
      data: {
        denomination: body.denomination?.trim(),
        sigle: body.sigle?.trim() || null,
        formeJuridique: body.formeJuridique?.trim() || null,
        capitalSocial: body.capitalSocial ? parseFloat(body.capitalSocial) : null,
        adresse: body.adresse?.trim() || null,
        ville: body.ville?.trim() || null,
        departement: body.departement?.trim() || null,
        region: body.region?.trim() || null,
        telephone: body.telephone?.trim() || null,
        email: body.email?.trim() || null,
        nomContact: body.nomContact?.trim() || null,
        siteWeb: body.siteWeb?.trim() || null,
        numContribuable: body.numContribuable?.trim() || null,
        secteurActivite: body.secteurActivite || null,
        sousSecteur: body.sousSecteur?.trim() || null,
        produitsPrincipaux: body.produitsPrincipaux?.trim() || null,
        estExportateur: body.estExportateur ?? null,
        estDansZoneIndustrielle: body.estDansZoneIndustrielle ?? null,
        nomZoneIndustrielle: body.nomZoneIndustrielle?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ Erreur PUT entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

// ✅ PATCH — Changer le statut (Admin/SuperAdmin uniquement)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = session.user.role;

    if (!userRole) {
      return NextResponse.json({ error: "Rôle non défini" }, { status: 403 });
    }

    // Seuls Admin et SuperAdmin peuvent changer le statut
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Seuls Admin et SuperAdmin peuvent valider/rejeter" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { statut } = body;

    if (!statut || !["ACTIF", "EN_ATTENTE", "REJETE"].includes(statut)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    const updated = await prisma.entreprise.update({
      where: { id: params.id },
      data: { statut },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ Erreur PATCH entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}

// ✅ DELETE — Supprimer une entreprise (SuperAdmin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = session.user.role;

    if (!userRole) {
      return NextResponse.json({ error: "Rôle non défini" }, { status: 403 });
    }

    // Seul SuperAdmin peut supprimer
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Seul le SuperAdmin peut supprimer" },
        { status: 403 }
      );
    }

    await prisma.entreprise.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Entreprise supprimée" });
  } catch (error) {
    console.error("❌ Erreur DELETE entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
