import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// ✅ PUT — Modifier une entreprise
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    const entreprise = await prisma.entreprise.update({
      where: { id: params.id },
      data: {
        denomination: body.denomination?.trim() || existing.denomination,
        sigle: body.sigle?.trim() || null,
        secteurActivite: body.secteurActivite || existing.secteurActivite,
        ville: body.ville?.trim() || null,
        region: body.region || existing.region,
        siteWeb: body.siteWeb?.trim() || null,
        produitsPrincipaux: body.produitsPrincipaux?.trim() || null,
        statut: body.statut || existing.statut,
      },
    });

    return NextResponse.json(entreprise);
  } catch (error: any) {
    console.error("Erreur modification entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

// ✅ DELETE — Supprimer une entreprise
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    await prisma.entreprise.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Entreprise supprimée" });
  } catch (error: any) {
    console.error("Erreur suppression entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}