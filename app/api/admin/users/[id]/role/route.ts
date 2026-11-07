import { NextResponse } from "next/server";
import { requireApiNiveau } from "@/lib/api-guard";
import { modifierCompte, CompteError } from "@/lib/comptes";

// PUT /api/admin/users/[id]/role { role } — attribution d'un rôle (super admin uniquement, voir lib/rbac.ts)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiNiveau("ADMIN");
  if (auth.error) return auth.error;
  try {
    const { role } = await request.json();
    const compte = await modifierCompte(auth.session.user, params.id, { role });
    return NextResponse.json({ success: true, role: compte.role });
  } catch (e) {
    if (e instanceof CompteError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Erreur API change role:", e);
    return NextResponse.json({ error: "Erreur lors du changement de rôle" }, { status: 500 });
  }
}
