/**
 * Référentiels : nomenclature des activités (CITI Rév.4) et filières industrielles.
 * Utilisé par scripts/db-deploy.js (déploiement) et par la base de test locale.
 * Toutes les opérations sont idempotentes (relançables sans doublon).
 */
const path = require("path");

const DOSSIER = path.join(__dirname, "..", "prisma", "referentiels");

// Correspondance des anciens secteurs saisis en texte libre -> filière (null = hors filière industrielle)
const ANCIENS_SECTEURS = {
  "btp / materiaux": "MATERIAUX_BTP",
  "metallurgie": "MINES_METAL",
  "energie": "ENERGIE",
  "chimie / plastique": "CHIMIE_PHARMA",
  "agriculture / agro-industrie": "AGRO",
  "agriculture / agro": "AGRO",
  "foret / bois": "FORET_BOIS",
  "pharmaceutique": "CHIMIE_PHARMA",
  "textile / habillement": "TEXTILE",
  "telecommunications / it": "NUMERIQUE",
  "telecoms / it": "NUMERIQUE",
  "industrie legere": "AUTRES_MANUF",
  "environnement / dechets": "EAU_DECHETS",
};
// Anciens secteurs relevant du champ industriel (sections B à E de la nomenclature)
const ANCIENS_INDUSTRIELS = new Set(["MATERIAUX_BTP", "MINES_METAL", "ENERGIE", "CHIMIE_PHARMA", "AGRO", "FORET_BOIS", "TEXTILE", "AUTRES_MANUF", "EAU_DECHETS"]);

const normaliser = (s) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

function lireReferentiels() {
  return {
    activites: require(path.join(DOSSIER, "citi4.json")),
    filieres: require(path.join(DOSSIER, "filieres.json")),
  };
}

/** Charge (ou met à jour) la nomenclature et les filières. */
async function chargerReferentiels(prisma) {
  const { activites, filieres } = lireReferentiels();

  // Lettre de section de chaque code
  const parCode = new Map(activites.map((a) => [a.code, a]));
  const sectionDe = (a) => {
    let cur = a;
    while (cur && cur.niveau !== "SECTION") cur = parCode.get(cur.parent);
    return cur ? cur.code : "";
  };

  // Les parents d'abord (la liste est déjà dans l'ordre hiérarchique)
  const existants = new Set((await prisma.activite.findMany({ select: { code: true } })).map((a) => a.code));
  const nouveaux = activites.filter((a) => !existants.has(a.code));
  for (const a of nouveaux) {
    await prisma.activite.create({
      data: { code: a.code, libelle: a.libelle, niveau: a.niveau, parentCode: a.parent || null, section: sectionDe(a) },
    });
  }

  for (const [i, f] of filieres.filieres.entries()) {
    await prisma.filiere.upsert({
      where: { code: f.code },
      update: { libelle: f.libelle, prioritaire: f.prioritaire, ordre: i + 1 },
      create: { code: f.code, libelle: f.libelle, prioritaire: f.prioritaire, ordre: i + 1 },
    });
    for (const prefixe of f.prefixes) {
      await prisma.filiereRegle.upsert({
        where: { prefixe },
        update: { filiereCode: f.code },
        create: { prefixe, filiereCode: f.code },
      });
    }
  }
  console.log(`Référentiels : ${activites.length} codes d'activité (${nouveaux.length} ajoutés), ${filieres.filieres.length} filières.`);
}

/**
 * Renseigne la filière des entreprises qui n'en ont pas encore :
 *  - à partir de leur activité codée si elle existe,
 *  - sinon à partir de l'ancien secteur saisi en texte libre.
 * Ne touche jamais une filière fixée manuellement.
 */
async function reclasserEntreprises(prisma) {
  const regles = await prisma.filiereRegle.findMany({ include: { filiere: true } });
  const sections = JSON.parse(JSON.stringify(require(path.join(DOSSIER, "filieres.json")).sectionsChampIndustriel));
  const filiereDeCode = (code) => {
    let best = null;
    for (const r of regles) if (code.startsWith(r.prefixe) && (!best || r.prefixe.length > best.prefixe.length)) best = r;
    return best ? best.filiere : null;
  };

  const aClasser = await prisma.entreprise.findMany({
    where: { filiereCode: null, filiereManuelle: false },
    select: { id: true, activiteCode: true, secteurActivite: true, activite: { select: { section: true } } },
  });
  let n = 0;
  for (const e of aClasser) {
    let filiere = null;
    let champ = false;
    if (e.activiteCode) {
      filiere = filiereDeCode(e.activiteCode);
      champ = sections.includes(e.activite?.section);
    } else {
      const code = ANCIENS_SECTEURS[normaliser(e.secteurActivite)];
      filiere = code ? regles.find((r) => r.filiereCode === code)?.filiere || null : null;
      champ = code ? ANCIENS_INDUSTRIELS.has(code) : false;
    }
    await prisma.entreprise.update({
      where: { id: e.id },
      data: {
        filiereCode: filiere?.code || null,
        champIndustriel: champ,
        ...(filiere ? { secteurActivite: filiere.libelle } : {}),
      },
    });
    if (filiere) n++;
  }
  console.log(`Reclassement : ${n} entreprise(s) rattachée(s) à une filière sur ${aClasser.length} à classer.`);
}

module.exports = { chargerReferentiels, reclasserEntreprises, normaliser };
