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

    const newStatus = action === "validate" ? "VALIDEE" : "REJETEE";

    await prisma.production.update({
      where: { id },
      data: { statut: newStatus },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Erreur API validate production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation" },
      { status: 500 }
    );
  }
}
