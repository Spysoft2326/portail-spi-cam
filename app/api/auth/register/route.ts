import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireApiRole } from "@/lib/api-guard";

const ALLOWED_ROLES = ["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"];

export async function POST(request: NextRequest) {
  // Création de comptes réservée aux administrateurs connectés
  const auth = await requireApiRole(["ADMIN", "SUPER_ADMIN"]);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, email, password } = body;
    const role = body.role || "AGENT_SAISIE";

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }
    // Seul un SUPER_ADMIN peut créer un ADMIN ou un SUPER_ADMIN
    if (role !== "AGENT_SAISIE" && auth.session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Seul un Super Admin peut attribuer ce rôle" }, { status: 403 });
    }

    // Validation des champs obligatoires
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erreur register:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
