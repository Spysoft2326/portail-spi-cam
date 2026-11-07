import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // ❌ REMOVED: isActive n'existe pas dans le modèle Prisma User
        emailVerified: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Erreur GET users:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: "ID et rôle requis" }, { status: 400 });
    }

    if (!["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }
    // Un ADMIN ne peut ni attribuer ADMIN/SUPER_ADMIN, ni modifier un compte admin
    if (session.user.role !== "SUPER_ADMIN") {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (role !== "AGENT_SAISIE" || (target && target.role !== "AGENT_SAISIE")) {
        return NextResponse.json({ error: "Seul un Super Admin peut gérer les rôles administrateurs" }, { status: 403 });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }, // jamais le mot de passe haché
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Erreur PATCH user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
    }
    // Un ADMIN ne peut supprimer que des agents
    if (session.user.role !== "SUPER_ADMIN") {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (target && target.role !== "AGENT_SAISIE") {
        return NextResponse.json({ error: "Seul un Super Admin peut supprimer un administrateur" }, { status: 403 });
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    console.error("❌ Erreur DELETE user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
