import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { id, action } = params;

    // NOTE: Le champ "statut" n'existe pas dans le modèle Production.
    // Cette API est désactivée temporairement pour éviter les erreurs de build.
    // Pour réactiver, ajouter "statut" au schéma Prisma puis faire "npx prisma db push".

    return NextResponse.json({ 
      success: false, 
      message: "Validation des productions non implémentée - champ statut inexistant dans le schéma" 
    });
  } catch (error) {
    console.error("Erreur API validate production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation" },
      { status: 500 }
    );
  }
}
