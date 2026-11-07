import { NextRequest, NextResponse } from "next/server";
import { requireApiNiveau } from "@/lib/api-guard";
import { creerCompte, CompteError } from "@/lib/comptes";

// POST /api/auth/register — création d'un compte (super admin uniquement).
// Le compte reçoit le mot de passe par défaut, dont le changement est imposé à la première connexion.
// (Un éventuel champ "password" envoyé est ignoré.)
export async function POST(request: NextRequest) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    const user = await creerCompte(auth.session.user, await request.json());
    return NextResponse.json({ message: "Utilisateur créé avec succès", user }, { status: 201 });
  } catch (e) {
    if (e instanceof CompteError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Erreur register:", e);
    return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 500 });
  }
}
