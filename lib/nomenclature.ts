import { prisma } from "@/lib/prisma";

/** Sections de la nomenclature formant le champ industriel : extraction, fabrication, énergie, eau-déchets. */
export const SECTIONS_INDUSTRIELLES = ["B", "C", "D", "E"];

export class NomenclatureError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/**
 * À partir d'un code de classe d'activité (CITI Rév.4, 4 chiffres), renvoie :
 *  - la classe d'activité,
 *  - la filière déduite par la table de passage (préfixe le plus long),
 *  - l'appartenance au champ industriel (sections B à E).
 */
export async function classerActivite(code: string) {
  const activite = await prisma.activite.findUnique({ where: { code } });
  if (!activite || activite.niveau !== "CLASSE") {
    throw new NomenclatureError(`Code d'activité inconnu ou trop général : ${code} (une classe à 4 chiffres est attendue)`);
  }
  const regles = await prisma.filiereRegle.findMany({ include: { filiere: true } });
  let meilleure: (typeof regles)[number] | null = null;
  for (const r of regles) {
    if (code.startsWith(r.prefixe) && (!meilleure || r.prefixe.length > meilleure.prefixe.length)) meilleure = r;
  }
  return {
    activite,
    filiere: meilleure?.filiere ?? null,
    champIndustriel: SECTIONS_INDUSTRIELLES.includes(activite.section),
  };
}

/**
 * Calcule les champs de classement d'une entreprise à partir de l'activité et d'une éventuelle
 * filière fixée manuellement (réservé aux administrateurs).
 */
export async function champsClassement(activiteCode: string | null | undefined, filiereManuelle?: string | null) {
  if (!activiteCode) {
    if (filiereManuelle) {
      const f = await prisma.filiere.findUnique({ where: { code: filiereManuelle } });
      if (!f) throw new NomenclatureError("Filière inconnue");
      return { activiteCode: null, filiereCode: f.code, filiereManuelle: true, secteurActivite: f.libelle };
    }
    return { activiteCode: null };
  }
  const { activite, filiere, champIndustriel } = await classerActivite(activiteCode);
  let f = filiere;
  let manuelle = false;
  if (filiereManuelle && filiereManuelle !== filiere?.code) {
    f = await prisma.filiere.findUnique({ where: { code: filiereManuelle } });
    if (!f) throw new NomenclatureError("Filière inconnue");
    manuelle = true;
  }
  return {
    activiteCode: activite.code,
    filiereCode: f?.code ?? null,
    filiereManuelle: manuelle,
    champIndustriel,
    secteurActivite: f?.libelle ?? "Hors filière",
  };
}
