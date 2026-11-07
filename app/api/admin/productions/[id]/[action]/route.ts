import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-guard";
import { decideDeclaration, DeclarationError } from "@/lib/declarations";

// POST /api/admin/productions/[id]/validate  { statut: "VALIDE" | "REJETE", motif?: string }
// Le motif est obligatoire pour un rejet ; il est affiché à l'agent qui corrige et resoumet.
export async function POST(request: NextRequest, { params }: { params: { id: string; action: string } }) {
  const auth = await requireApiRole(["ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;

  if (params.action !== "validate") {
    return NextResponse.json({ error: "Action non reconnue. Utilisez 'validate'" }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!["VALIDE", "REJETE"].includes(body.statut)) {
      return NextResponse.json({ error: "Statut invalide. Utilisez VALIDE ou REJETE" }, { status: 400 });
    }
    const production = await decideDeclaration(
      auth.session.user as { id: string; role: string },
      params.id,
      body.statut,
      body.motif
    );
    return NextResponse.json({
      message: body.statut === "VALIDE" ? "Déclaration validée" : "Déclaration rejetée",
      production,
    });
  } catch (error) {
    if (error instanceof DeclarationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[ADMIN_VALIDATE]", error);
    return NextResponse.json({ error: "Erreur lors de la validation" }, { status: 500 });
  }
}
