import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-guard";
import { logAudit } from "@/lib/declarations";

// Établissements (sites, usines) d'une entreprise.
//   GET    : utilisateurs connectés
//   POST   : Admin / Super Admin, ou l'agent sur sa propre fiche non validée
//   PATCH  : { etablissementId, ...champs } — mêmes droits que POST
//   DELETE : ?etablissementId= — Admin / Super Admin (l'établissement principal ne peut pas être supprimé)

type Ctx = { params: { id: string } };
const CHAMPS = ["nom", "region", "departement", "ville", "quartier", "lieuDit", "adresse", "telephone"] as const;

async function droits(entrepriseId: string, user: { id: string; role: string }) {
  const entreprise = await prisma.entreprise.findUnique({ where: { id: entrepriseId } });
  if (!entreprise) return { erreur: NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 }) };
  const admin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const agentProprietaire = user.role === "AGENT_SAISIE" && entreprise.agentId === user.id && entreprise.statut !== "ACTIF";
  if (!admin && !agentProprietaire) return { erreur: NextResponse.json({ error: "Non autorisé" }, { status: 403 }) };
  return { entreprise };
}

async function donnees(body: any) {
  const data: any = {};
  for (const c of CHAMPS) if (body[c] !== undefined) data[c] = typeof body[c] === "string" ? body[c].trim() || null : null;
  if (body.classeEtablissement !== undefined) {
    data.classeEtablissement = ["1", "2"].includes(String(body.classeEtablissement)) ? String(body.classeEtablissement) : null;
  }
  for (const c of ["latitude", "longitude"] as const) {
    if (body[c] !== undefined) {
      const v = body[c] === "" || body[c] === null ? null : Number(body[c]);
      if (v !== null && Number.isNaN(v)) throw new Error(`${c} invalide`);
      data[c] = v;
    }
  }
  if (body.activiteCode !== undefined) {
    if (body.activiteCode) {
      const a = await prisma.activite.findUnique({ where: { code: body.activiteCode } });
      if (!a || a.niveau !== "CLASSE") throw new Error("Code d'activité inconnu");
    }
    data.activiteCode = body.activiteCode || null;
  }
  return data;
}

export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireApiRole(["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const etablissements = await prisma.etablissement.findMany({
    where: { entrepriseId: params.id },
    orderBy: [{ principal: "desc" }, { createdAt: "asc" }],
    include: { activite: { select: { code: true, libelle: true } } },
  });
  return NextResponse.json(etablissements);
}

export async function POST(request: Request, { params }: Ctx) {
  const auth = await requireApiRole(["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const user = auth.session.user as { id: string; role: string };
  const d = await droits(params.id, user);
  if (d.erreur) return d.erreur;
  try {
    const data = await donnees(await request.json());
    if (!data.ville && !data.nom) return NextResponse.json({ error: "Indiquez au moins un nom ou une ville" }, { status: 400 });
    const etab = await prisma.etablissement.create({ data: { ...data, entrepriseId: params.id, principal: false } });
    await logAudit(user.id, "ETABLISSEMENT_AJOUTE", "Entreprise", params.id, [data.nom, data.ville].filter(Boolean).join(" — "));
    return NextResponse.json(etab, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Données invalides" }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireApiRole(["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const user = auth.session.user as { id: string; role: string };
  const d = await droits(params.id, user);
  if (d.erreur) return d.erreur;
  try {
    const body = await request.json();
    const etab = await prisma.etablissement.findFirst({ where: { id: body.etablissementId, entrepriseId: params.id } });
    if (!etab) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
    const updated = await prisma.etablissement.update({ where: { id: etab.id }, data: await donnees(body) });
    await logAudit(user.id, "ETABLISSEMENT_MODIFIE", "Entreprise", params.id, etab.nom || etab.ville || etab.id);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Données invalides" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await requireApiRole(["ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("etablissementId");
  const etab = id ? await prisma.etablissement.findFirst({ where: { id, entrepriseId: params.id } }) : null;
  if (!etab) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  if (etab.principal) return NextResponse.json({ error: "L'établissement principal ne peut pas être supprimé" }, { status: 400 });
  await prisma.etablissement.delete({ where: { id: etab.id } });
  await logAudit(auth.session.user.id, "ETABLISSEMENT_SUPPRIME", "Entreprise", params.id, etab.nom || etab.ville || etab.id);
  return NextResponse.json({ success: true });
}
