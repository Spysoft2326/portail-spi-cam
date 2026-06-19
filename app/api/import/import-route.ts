import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(";").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const cells = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        cells.push(cell.trim().replace(/^"|"$/g, ""));
        cell = "";
      } else {
        cell += char;
      }
    }
    cells.push(cell.trim().replace(/^"|"$/g, ""));
    return cells;
  });
  return { headers, rows };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entity = formData.get("entity") as string || "entreprises";

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    const csvText = await file.text();
    const { headers, rows } = parseCSV(csvText);

    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    if (entity === "entreprises") {
      for (const row of rows) {
        try {
          const data: any = {};
          headers.forEach((h, i) => {
            const val = row[i] || "";
            switch (h.toLowerCase()) {
              case "denomination": data.denomination = val; break;
              case "sigle": data.sigle = val || null; break;
              case "secteur": data.secteurActivite = val || "AUTRE"; break;
              case "ville": data.ville = val || null; break;
              case "region": data.region = val || "Centre"; break;
              case "telephone": data.telephone = val || null; break;
              case "email": data.email = val || null; break;
              case "contact": data.nomContact = val || null; break;
              case "adresse": data.adresse = val || null; break;
              case "statut": data.statut = val || "ACTIF"; break;
            }
          });

          if (!data.denomination) {
            errors++;
            errorDetails.push(`Ligne ${rows.indexOf(row) + 2}: Denomination manquante`);
            continue;
          }

          // Generer referenceSPI unique
          const count = await prisma.entreprise.count();
          data.referenceSPI = `SPI-CAM-${String(count + 1 + rows.indexOf(row)).padStart(3, "0")}`;

          await prisma.entreprise.create({ data });
          created++;
        } catch (err: any) {
          errors++;
          errorDetails.push(`Ligne ${rows.indexOf(row) + 2}: ${err.message}`);
        }
      }
    } else if (entity === "users") {
      for (const row of rows) {
        try {
          const data: any = {};
          headers.forEach((h, i) => {
            const val = row[i] || "";
            switch (h.toLowerCase()) {
              case "nom": data.name = val || null; break;
              case "email": data.email = val; break;
              case "role": data.role = val || "AGENT_SAISIE"; break;
            }
          });

          if (!data.email) {
            errors++;
            errorDetails.push(`Ligne ${rows.indexOf(row) + 2}: Email manquant`);
            continue;
          }

          // Verifier si l'email existe deja
          const existing = await prisma.user.findUnique({ where: { email: data.email } });
          if (existing) {
            await prisma.user.update({ where: { email: data.email }, data: { role: data.role } });
            updated++;
          } else {
            await prisma.user.create({ data: { ...data, password: "changeme123" } });
            created++;
          }
        } catch (err: any) {
          errors++;
          errorDetails.push(`Ligne ${rows.indexOf(row) + 2}: ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      errors,
      errorDetails: errorDetails.slice(0, 10), // Limiter a 10 erreurs
      total: rows.length,
    });
  } catch (error: any) {
    console.error("Erreur import:", error);
    return NextResponse.json({ error: "Erreur lors de l'import" }, { status: 500 });
  }
}
