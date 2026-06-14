import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

// GET - Lister tous les utilisateurs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erreur API GET users:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des utilisateurs" },
      { status: 500 }
    );
  }
}

// POST - Créer un utilisateur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: "Nom et email sont requis" }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est deja utilise" }, { status: 400 });
    }

    // Vérifier les permissions pour créer un Super Admin
    if (role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Seul un Super Admin peut creer un Super Admin" }, { status: 403 });
    }

    // Générer un mot de passe par défaut si non fourni
    const userPassword = password || `Temp${Date.now()}`;
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "AGENT_SAISIE",
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Retourner le mot de passe généré si auto-généré
    const response: any = { ...user };
    if (!password) {
      response.generatedPassword = userPassword;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Erreur API POST users:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la creation de l'utilisateur" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un utilisateur
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, role, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Erreur API PUT users:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur API DELETE users:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
