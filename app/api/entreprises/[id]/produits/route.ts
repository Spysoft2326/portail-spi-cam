import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-guard";
import { logAudit } from "@/lib/declarations";
import { normaliser } from "@/lib/referentiels";

// Catalogue des produits d'une entreprise.
//   GET    : tout utilisateur connecté (le formulaire de déclaration s'en sert)
//   POST   : ajouter un produit — Admin / Super Admin, ou l'agent sur une entreprise active ou sa propre fiche
//   PATCH  : renommer / changer l'unité / activer-désactiver — Admin / Super Admin
//            (un produit n'est jamais supprimé : les déclarations passées y font référence)

type Ctx = { params: { id: string } };
const ROLES = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];

export async function GET(request: Request, { params }: Ctx) {
  const auth = await requireApiRole(ROLES);
  if (auth.error) return auth.error;
  const tous = new URL(request.url).searchParams.get("tous") === "1";

  const produits = await prisma.produit.findMany({
    where: { entrepriseId: params.id, ...(tous ? {} : { actif: true }) },
    orderBy: { nom: "asc" },
    include: { _count: { select: { lignes: true } } },
  });
  return NextResponse.json(produits);
}

export async function POST(request: Request, { params }: Ctx) {
  const auth = await requireApiRole(ROLES);
  if (auth.error) return auth.error;
  const user = auth.session.user as { id: string; role: string };

  const entreprise = await prisma.entreprise.findUnique({ where: { id: params.id } });
  if (!entreprise) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  if (user.role === "AGENT_SAISIE" && entreprise.statut !== "ACTIF" && entreprise.agentId !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const nom = typeof body.nom === "string" ? body.nom.trim().slice(0, 120) : "";
  const unite = typeof body.unite === "string" && body.unite.trim() ? body.unite.trim().slice(0, 20) : "";
  if (!nom || !unite) return NextResponse.json({ error: "Nom et unité du produit obligatoires" }, { status: 400 });

  const existants = await prisma.produit.findMany({ where: { entrepriseId: params.id } });
  const doublon = existants.find((p) => normaliser(p.nom) === normaliser(nom));
  if (doublon) {
    if (!doublon.actif) {
      const reactive = await prisma.produit.update({ where: { id: doublon.id }, data: { actif: true, unite } });
      return NextResponse.json(reactive, { status: 200 });
    }
    return NextResponse.json({ error: `Le produit « ${doublon.nom} » existe déjà pour cette entreprise` }, { status: 409 });
  }

  const produit = await prisma.produit.create({ data: { entrepriseId: params.id, nom, unite } });
  await logAudit(user.id, "PRODUIT_AJOUTE", "Entreprise", params.id, `${nom} (${unite})`);
  return NextResponse.json(produit, { status: 201 });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireApiRole(["ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const produit = body.produitId
    ? await prisma.produit.findFirst({ where: { id: body.produitId, entrepriseId: params.id } })
    : null;
  if (!produit) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  const data: any = {};
  if (typeof body.nom === "string" && body.nom.trim()) data.nom = body.nom.trim().slice(0, 120);
  if (typeof body.unite === "string" && body.unite.trim()) data.unite = body.unite.trim().slice(0, 20);
  if (typeof body.actif === "boolean") data.actif = body.actif;

  try {
    const updated = await prisma.produit.update({ where: { id: produit.id }, data });
    await logAudit(auth.session.user.id, "PRODUIT_MODIFIE", "Entreprise", params.id, JSON.stringify({ produit: produit.nom, ...data }));
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Un produit porte déjà ce nom" }, { status: 409 });
  }
}
