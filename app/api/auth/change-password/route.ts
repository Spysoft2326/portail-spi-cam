import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-guard";
import { verifierMotDePasse } from "@/lib/rbac";
import { logAudit } from "@/lib/declarations";

// POST /api/auth/change-password { currentPassword, newPassword }
// Tout utilisateur connecté change SON propre mot de passe (y compris le mot de passe par défaut imposé).
export async function POST(request: NextRequest) {
  const auth = await requireApiRole(undefined, { autoriserMotDePasseParDefaut: true });
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Mot de passe actuel et nouveau mot de passe obligatoires" }, { status: 400 });
    }
    const probleme = verifierMotDePasse(newPassword);
    if (probleme) return NextResponse.json({ error: probleme }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, password: true } });
    if (!user?.password || !(await bcrypt.compare(String(currentPassword), user.password))) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit être différent de l'actuel" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 12), doitChangerMotDePasse: false },
    });
    await logAudit(user.id, "MOT_DE_PASSE_CHANGE", "User", user.id);
    return NextResponse.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur change-password:", error);
    return NextResponse.json({ error: "Erreur lors de la modification du mot de passe" }, { status: 500 });
  }
}
