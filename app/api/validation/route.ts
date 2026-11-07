import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-guard";
import { decideDeclaration, DeclarationError } from "@/lib/declarations";

// Ancienne route de validation (POST { productionId, action: "VALIDEE"|"REJETEE", commentaireValidation }).
// Elle se contentait d'écrire un journal sans changer le statut : elle applique maintenant
// réellement la décision, via la même logique que /api/admin/productions/[id]/validate.
export async function POST(request: NextRequest) {
  const auth = await requireApiRole(["ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;

  try {
    const { productionId, action, commentaireValidation } = await request.json();
    const statut = action === "VALIDEE" ? "VALIDE" : action === "REJETEE" ? "REJETE" : null;
    if (!productionId || !statut) {
      return NextResponse.json({ error: "productionId et action (VALIDEE ou REJETEE) obligatoires" }, { status: 400 });
    }
    const production = await decideDeclaration(
      auth.session.user as { id: string; role: string },
      productionId,
      statut,
      commentaireValidation
    );
    return NextResponse.json({ success: true, production });
  } catch (error) {
    if (error instanceof DeclarationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[VALIDATION]", error);
    return NextResponse.json({ error: "Erreur lors de la validation" }, { status: 500 });
  }
}
