import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toCSV(data: any[], headers: string[]): string {
  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(";") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((row) => headers.map((h) => escape(row[h])).join(";"));
  return [headers.join(";"), ...rows].join("\n");
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity") || "all";
    const format = searchParams.get("format") || "csv";

    let csv = "";
    let filename = "";

    if (entity === "entreprises" || entity === "all") {
      const entreprises = await prisma.entreprise.findMany({
        select: {
          referenceSPI: true,
          denomination: true,
          sigle: true,
          secteurActivite: true,
          ville: true,
          region: true,
          telephone: true,
          email: true,
          nomContact: true,
          statut: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = ["Reference SPI", "Denomination", "Sigle", "Secteur", "Ville", "Region", "Telephone", "Email", "Contact", "Statut", "Date creation"];
      const data = entreprises.map((e) => ({
        "Reference SPI": e.referenceSPI,
        "Denomination": e.denomination,
        "Sigle": e.sigle || "",
        "Secteur": e.secteurActivite,
        "Ville": e.ville || "",
        "Region": e.region || "",
        "Telephone": e.telephone || "",
        "Email": e.email || "",
        "Contact": e.nomContact || "",
        "Statut": e.statut,
        "Date creation": e.createdAt.toISOString().split("T")[0],
      }));

      csv += toCSV(data, headers) + "\n\n";
      filename = "entreprises_" + new Date().toISOString().split("T")[0] + ".csv";
    }

    if (entity === "users" || entity === "all") {
      const users = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          role: true,
          emailVerified: true,
        },
        orderBy: { id: "desc" },
      });

      const headers = ["Nom", "Email", "Role", "Email verifie"];
      const data = users.map((u) => ({
        "Nom": u.name || "",
        "Email": u.email || "",
        "Role": u.role,
        "Email verifie": u.emailVerified ? "Oui" : "Non",
      }));

      csv += "=== UTILISATEURS ===\n" + toCSV(data, headers) + "\n\n";
      if (!filename) filename = "users_" + new Date().toISOString().split("T")[0] + ".csv";
    }

    if (entity === "productions" || entity === "all") {
      const productions = await prisma.production.findMany({
        include: {
          entreprise: { select: { denomination: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = ["Entreprise", "Produit", "Quantite", "Unite", "Periode", "Annee", "Trimestre", "Date creation"];
      const data = productions.map((p) => ({
        "Entreprise": p.entreprise?.denomination || "",
        "Produit": p.produit,
        "Quantite": p.quantite || "",
        "Unite": p.unite || "",
        "Periode": p.periode || "",
        "Annee": p.annee || "",
        "Trimestre": p.trimestre || "",
        "Date creation": p.createdAt.toISOString().split("T")[0],
      }));

      csv += "=== PRODUCTIONS ===\n" + toCSV(data, headers) + "\n\n";
      if (!filename) filename = "productions_" + new Date().toISOString().split("T")[0] + ".csv";
    }

    if (entity === "all") {
      filename = "export_complet_" + new Date().toISOString().split("T")[0] + ".csv";
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erreur export:", error);
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }
}
