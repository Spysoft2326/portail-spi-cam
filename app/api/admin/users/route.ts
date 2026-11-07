import { NextResponse } from "next/server";
import { requireApiNiveau } from "@/lib/api-guard";
import { listerComptes, creerCompte, modifierCompte, supprimerCompte, CompteError } from "@/lib/comptes";

// Gestion des comptes (voir lib/rbac.ts) :
//   GET    : liste (super admin : tous ; admin : les agents et lui-même)
//   POST   : création — super admin uniquement (mot de passe par défaut, changement imposé)
//   PATCH  : { id, ...champs } — compatibilité ; préférer PATCH /api/admin/users/[id]
//   DELETE : ?id= — super admin uniquement

const erreur = (e: unknown) =>
  e instanceof CompteError
    ? NextResponse.json({ error: e.message }, { status: e.status })
    : (console.error("[USERS]", e), NextResponse.json({ error: "Erreur serveur" }, { status: 500 }));

export async function GET() {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    return NextResponse.json(await listerComptes(auth.session.user));
  } catch (e) { return erreur(e); }
}

export async function POST(request: Request) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    return NextResponse.json(await creerCompte(auth.session.user, await request.json()), { status: 201 });
  } catch (e) { return erreur(e); }
}

export async function PATCH(request: Request) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    return NextResponse.json(await modifierCompte(auth.session.user, id, data));
  } catch (e) { return erreur(e); }
}

export async function DELETE(request: Request) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    await supprimerCompte(auth.session.user, id);
    return NextResponse.json({ success: true, message: "Utilisateur supprimé" });
  } catch (e) { return erreur(e); }
}
