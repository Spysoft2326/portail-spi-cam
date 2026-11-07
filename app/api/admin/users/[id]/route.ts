import { NextResponse } from "next/server";
import { requireApiNiveau } from "@/lib/api-guard";
import { listerComptes, modifierCompte, supprimerCompte, CompteError } from "@/lib/comptes";

// Un compte utilisateur (ce fichier gérait auparavant, par erreur, des productions).
//   GET    : détail (si visible par l'acteur)
//   PATCH  : { name, email, identifiant, role, actif, reinitialiserMotDePasse }
//   DELETE : suppression (super admin)

type Ctx = { params: { id: string } };
const erreur = (e: unknown) =>
  e instanceof CompteError
    ? NextResponse.json({ error: e.message }, { status: e.status })
    : (console.error("[USER]", e), NextResponse.json({ error: "Erreur serveur" }, { status: 500 }));

export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  const compte = (await listerComptes(auth.session.user)).find((c) => c.id === params.id);
  return compte ? NextResponse.json(compte) : NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    return NextResponse.json(await modifierCompte(auth.session.user, params.id, await request.json()));
  } catch (e) { return erreur(e); }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    await supprimerCompte(auth.session.user, params.id);
    return NextResponse.json({ success: true });
  } catch (e) { return erreur(e); }
}
