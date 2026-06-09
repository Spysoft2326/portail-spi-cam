import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { id } = params;
    const { role } = await request.json();

    if (!["AGENT_SAISIE", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Role invalide" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Erreur API change role:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de role" },
      { status: 500 }
    );
  }
}
