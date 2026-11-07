import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/declarations";
import { normaliser, nettoyerProduits } from "@/lib/referentiels";
import { champsClassement, NomenclatureError } from "@/lib/nomenclature";

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

    // Visibilité selon le rôle :
    //   Public : entreprises ACTIF uniquement
    //   Agent  : toutes les ACTIF + ses propres saisies (en attente / rejetées) pour pouvoir les suivre et corriger
    //   Admin / Super Admin : toutes (filtre ?statut= optionnel)
    const where: any = {};
    const and: any[] = [];
    const isAdminRole = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    if (isAdminRole) {
      if (statutParam && statutParam !== "ALL") where.statut = statutParam;
    } else if (userRole === "AGENT_SAISIE") {
      and.push({ OR: [{ statut: "ACTIF" }, { agentId: userId }] });
      if (statutParam && statutParam !== "ALL") where.statut = statutParam;
    } else {
      where.statut = "ACTIF";
    }

    // Recherche textuelle (nom, sigle, ville, contact, téléphone, email)
    if (search) {
      and.push({ OR: [
        { denomination: { contains: search, mode: "insensitive" } },
        { sigle: { contains: search, mode: "insensitive" } },
        { ville: { contains: search, mode: "insensitive" } },
        { nomContact: { contains: search, mode: "insensitive" } },
        { telephone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { adresse: { contains: search, mode: "insensitive" } },
      ] });
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

    // Filtres de nomenclature : ?filiere=AGRO, ?activite=1073 (ou préfixe 10, 107), ?champ=industriel|hors
    const filiere = searchParams.get("filiere");
    const activite = searchParams.get("activite");
    const champ = searchParams.get("champ");
    if (filiere) where.filiereCode = filiere;
    if (activite) where.activiteCode = { startsWith: activite };
    if (champ === "industriel") where.champIndustriel = true;
    if (champ === "hors") where.champIndustriel = false;

    if (and.length) where.AND = and;

    const entreprises = await prisma.entreprise.findMany({
      where,
      orderBy: { denomination: "asc" },
      include: {
        activite: { select: { code: true, libelle: true, section: true } },
        filiere: { select: { code: true, libelle: true, prioritaire: true } },
        _count: {
          select: { productions: true, produits: true, etablissements: true },
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

    const denomination = body.denomination?.trim();
    if (!denomination) {
      return NextResponse.json({ error: "La dénomination est obligatoire" }, { status: 400 });
    }

    // Doublon : même dénomination (sans tenir compte de la casse ni des accents)
    const cle = normaliser(denomination);
    const existantes = await prisma.entreprise.findMany({ select: { denomination: true, statut: true } });
    const doublon = existantes.find((e) => normaliser(e.denomination) === cle);
    if (doublon) {
      return NextResponse.json(
        { error: `Une entreprise « ${doublon.denomination} » existe déjà (statut : ${doublon.statut})` },
        { status: 409 }
      );
    }

    // Workflow : une fiche créée par un agent attend la validation d'un admin ;
    // un admin ou super admin crée directement une fiche active.
    const statut = userRole === "AGENT_SAISIE" ? "EN_ATTENTE" : "ACTIF";

    // Produits fabriqués par l'entreprise (catalogue) : [{ nom, unite }]
    const produits = nettoyerProduits(body.produits);

    // Activité principale codée (classe CITI Rév.4) -> filière et champ industriel.
    // Seul un administrateur peut imposer une filière différente de celle déduite.
    if (!body.activiteCode) {
      return NextResponse.json({ error: "L'activité principale (code de la nomenclature) est obligatoire" }, { status: 400 });
    }
    const classement = await champsClassement(body.activiteCode, userRole === "AGENT_SAISIE" ? null : body.filiereCode);

    // NIU : unique s'il est renseigné
    const niu = body.numContribuable?.trim() || null;
    if (niu && (await prisma.entreprise.findFirst({ where: { numContribuable: niu }, select: { id: true } }))) {
      return NextResponse.json({ error: `Le NIU ${niu} est déjà attribué à une autre entreprise` }, { status: 409 });
    }
    const taille = ["GE", "PME", "TPE"].includes(body.taille) ? body.taille : null;

    const entreprise = await prisma.entreprise.create({
      data: {
        referenceSPI: body.referenceSPI?.trim() || `SPI-${Date.now()}`,
        denomination,
        sigle: body.sigle?.trim() || null,
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
        numContribuable: niu,
        taille,
        ...classement,
        sousSecteur: body.sousSecteur?.trim() || null,
        produitsPrincipaux: body.produitsPrincipaux?.trim() || produits.map((p) => p.nom).join(", ") || null,
        statut,
        estExportateur: body.estExportateur || false,
        estDansZoneIndustrielle: body.estDansZoneIndustrielle || false,
        nomZoneIndustrielle: body.nomZoneIndustrielle?.trim() || null,
        agentId: userRole === "AGENT_SAISIE" ? session.user.id : null,
        produits: { create: produits },
        // Établissement principal créé à partir de l'adresse de la fiche
        etablissements: {
          create: {
            principal: true,
            nom: "Siège / site principal",
            activiteCode: classement.activiteCode,
            region: body.region?.trim() || null,
            ville: body.ville?.trim() || null,
            adresse: body.adresse?.trim() || null,
            telephone: body.telephone?.trim() || null,
          },
        },
      },
      include: { produits: true, filiere: true, activite: true },
    });

    await logAudit(session.user.id, "ENTREPRISE_CREEE", "Entreprise", entreprise.id, `${denomination} (${statut})`);
    return NextResponse.json(entreprise, { status: 201 });
  } catch (error) {
    if (error instanceof NomenclatureError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("❌ Erreur POST entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entreprise" },
      { status: 500 }
    );
  }
}
