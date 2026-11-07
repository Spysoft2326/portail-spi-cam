import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/declarations";

// ✅ GET — Détails d'une entreprise
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const entreprise = await prisma.entreprise.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productions: true },
        },
        produits: { where: { actif: true }, orderBy: { nom: "asc" }, select: { id: true, nom: true, unite: true } },
      },
    });

    // Une fiche non validée n'est visible que des admins et de l'agent qui l'a saisie
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    const visible =
      entreprise &&
      (entreprise.statut === "ACTIF" ||
        role === "ADMIN" || role === "SUPER_ADMIN" ||
        (role === "AGENT_SAISIE" && entreprise.agentId === session?.user?.id));

    if (!entreprise || !visible) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(entreprise);
  } catch (error) {
    console.error("❌ Erreur GET entreprise:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ✅ PATCH — Modifier une entreprise (Admin/SuperAdmin/Agent) ou valider (Admin/SuperAdmin)
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

    // ✅ FIX: Vérifier que userRole est défini
    if (!userRole) {
      return NextResponse.json({ error: "Rôle non défini" }, { status: 403 });
    }

    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "AGENT_SAISIE"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const isAgent = userRole === "AGENT_SAISIE";

    // Agent : uniquement ses propres fiches, tant qu'elles ne sont pas validées
    if (isAgent) {
      if (existing.agentId !== session.user.id) {
        return NextResponse.json({ error: "Vous ne pouvez modifier que vos propres saisies" }, { status: 403 });
      }
      if (existing.statut === "ACTIF" || existing.statut === "INACTIF") {
        return NextResponse.json(
          { error: "Fiche déjà validée : demandez à un administrateur de la modifier" },
          { status: 403 }
        );
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    let auditAction = "ENTREPRISE_MODIFIEE";

    // Changement de statut (validation / rejet / désactivation) : Admin et Super Admin
    if (body.statut !== undefined) {
      if (isAgent) {
        return NextResponse.json({ error: "Seuls Admin et SuperAdmin peuvent valider" }, { status: 403 });
      }
      if (!["EN_ATTENTE", "ACTIF", "REJETE", "INACTIF"].includes(body.statut)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      if (body.statut === "REJETE") {
        const motif = typeof body.motifRejet === "string" ? body.motifRejet.trim() : "";
        if (!motif) return NextResponse.json({ error: "Le motif du rejet est obligatoire" }, { status: 400 });
        updateData.motifRejet = motif;
      } else {
        updateData.motifRejet = null;
      }
      updateData.statut = body.statut;
      auditAction = { ACTIF: "ENTREPRISE_VALIDEE", REJETE: "ENTREPRISE_REJETEE", INACTIF: "ENTREPRISE_DESACTIVEE", EN_ATTENTE: "ENTREPRISE_REMISE_EN_ATTENTE" }[body.statut as string]!;
    }

    // Une fiche corrigée par l'agent (en attente ou rejetée) repart en validation
    if (isAgent) {
      updateData.statut = "EN_ATTENTE";
      updateData.motifRejet = null;
      if (existing.statut === "REJETE") auditAction = "ENTREPRISE_RESOUMISE";
    }

    // Si c'est une modification complète
    if (body.denomination !== undefined) {
      if (!body.denomination?.trim()) {
        return NextResponse.json({ error: "La dénomination est obligatoire" }, { status: 400 });
      }
      updateData.denomination = body.denomination.trim();
    }
    if (body.sigle !== undefined) updateData.sigle = body.sigle?.trim() || null;
    if (body.secteurActivite !== undefined) updateData.secteurActivite = body.secteurActivite;
    if (body.ville !== undefined) updateData.ville = body.ville?.trim() || null;
    // region est obligatoire dans le schéma : on ne la vide jamais
    if (body.region !== undefined && body.region?.trim()) updateData.region = body.region.trim();
    if (body.adresse !== undefined) updateData.adresse = body.adresse?.trim() || null;
    if (body.telephone !== undefined) updateData.telephone = body.telephone?.trim() || null;
    if (body.email !== undefined) updateData.email = body.email?.trim() || null;
    if (body.nomContact !== undefined) updateData.nomContact = body.nomContact?.trim() || null;
    if (body.siteWeb !== undefined) updateData.siteWeb = body.siteWeb?.trim() || null;
    if (body.formeJuridique !== undefined) updateData.formeJuridique = body.formeJuridique?.trim() || null;
    if (body.capitalSocial !== undefined) updateData.capitalSocial = body.capitalSocial ? parseFloat(body.capitalSocial) : null;
    if (body.departement !== undefined) updateData.departement = body.departement?.trim() || null;
    if (body.numContribuable !== undefined) updateData.numContribuable = body.numContribuable?.trim() || null;
    if (body.sousSecteur !== undefined) updateData.sousSecteur = body.sousSecteur?.trim() || null;
    if (body.produitsPrincipaux !== undefined) updateData.produitsPrincipaux = body.produitsPrincipaux?.trim() || null;
    if (body.estExportateur !== undefined) updateData.estExportateur = body.estExportateur;
    if (body.estDansZoneIndustrielle !== undefined) updateData.estDansZoneIndustrielle = body.estDansZoneIndustrielle;
    if (body.nomZoneIndustrielle !== undefined) updateData.nomZoneIndustrielle = body.nomZoneIndustrielle?.trim() || null;

    const entreprise = await prisma.entreprise.update({
      where: { id },
      data: updateData,
    });

    await logAudit(session.user.id, auditAction, "Entreprise", id, updateData.motifRejet || undefined);
    return NextResponse.json(entreprise);
  } catch (error) {
    console.error("❌ Erreur PATCH entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'entreprise" },
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

    // ✅ FIX: Vérifier que userRole est défini
    if (!userRole) {
      return NextResponse.json({ error: "Rôle non défini" }, { status: 403 });
    }

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Seul le SuperAdmin peut supprimer" }, { status: 403 });
    }

    const { id } = params;

    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    // Supprimer les productions liées d'abord (si contrainte de clé étrangère)
    await prisma.production.deleteMany({ where: { entrepriseId: id } });

    // Supprimer l'entreprise
    await prisma.entreprise.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Entreprise supprimée" });
  } catch (error) {
    console.error("❌ Erreur DELETE entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entreprise" },
      { status: 500 }
    );
  }
}
